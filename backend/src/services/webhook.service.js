const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');
const { info, warn, error: logError } = require('../logger/logger');
const LOG_EVENTS = require('../logger/log-events');
const bookingService = require('./booking.service');

const isSuccessEvent = (eventType) => {
  const value = eventType.toLowerCase();
  return [
    'payment.success',
    'payment_success',
    'payment.successful',
    'payment_successful',
    'success',
    'succeeded',
  ].includes(value);
};

const isFailedEvent = (eventType) => {
  const value = eventType.toLowerCase();
  return [
    'payment.failed',
    'payment_failed',
    'payment.failure',
    'payment_failure',
    'failed',
    'failure',
  ].includes(value);
};

const getExistingEvent = async (eventId) => {
  const { data, error } = await supabaseAdmin
    .from('webhook_events')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) {
    throw ApiError.internal('Unable to check webhook event', {
      code: 'WEBHOOK_LOOKUP_FAILED',
      details: error.message,
    });
  }

  return data;
};

const processWebhook = async ({
  event_id,
  event_type,
  payment_id = null,
  payload = {},
}) => {
  info({
    event: LOG_EVENTS.WEBHOOK_RECEIVED,
    message: 'Payment webhook received',
    metadata: {
      eventId: event_id,
      eventType: event_type,
      paymentId: payment_id,
    },
  });

  const existing = await getExistingEvent(event_id);

  if (existing) {
    warn({
      event: LOG_EVENTS.WEBHOOK_DUPLICATE,
      message: 'Duplicate payment webhook ignored safely',
      metadata: {
        eventId: event_id,
        existingStatus: existing.status,
      },
    });

    if (existing.status === 'FAILED') {
      throw ApiError.conflict('Webhook event was already processed as failed', {
        code: 'WEBHOOK_PREVIOUSLY_FAILED',
      });
    }

    return {
      duplicate: true,
      event: existing,
    };
  }

  const { data: event, error: insertError } = await supabaseAdmin
    .from('webhook_events')
    .insert({
      event_id,
      event_type,
      payment_id,
      payload,
      status: 'RECEIVED',
    })
    .select('*')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      const duplicate = await getExistingEvent(event_id);
      return {
        duplicate: true,
        event: duplicate,
      };
    }

    throw ApiError.internal('Unable to record webhook event', {
      code: 'WEBHOOK_CREATE_FAILED',
      details: insertError.message,
    });
  }

  try {
    if (!isSuccessEvent(event_type) && !isFailedEvent(event_type)) {
      throw ApiError.badRequest('Unsupported webhook event type', {
        code: 'WEBHOOK_EVENT_TYPE_UNSUPPORTED',
      });
    }

    if (!payment_id) {
      throw ApiError.badRequest('Payment ID is required for payment webhook', {
        code: 'WEBHOOK_PAYMENT_ID_REQUIRED',
      });
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('id, booking_id, amount, status')
      .eq('id', payment_id)
      .maybeSingle();

    if (paymentError) {
      throw ApiError.internal('Unable to retrieve payment for webhook', {
        code: 'WEBHOOK_PAYMENT_LOOKUP_FAILED',
        details: paymentError.message,
      });
    }

    if (!payment) {
      throw ApiError.notFound('Payment not found', {
        code: 'PAYMENT_NOT_FOUND',
      });
    }

    if (isSuccessEvent(event_type)) {
      if (payment.status === 'SUCCESS') {
        await supabaseAdmin
          .from('webhook_events')
          .update({
            status: 'PROCESSED',
            processed_at: new Date().toISOString(),
          })
          .eq('id', event.id);

        return {
          duplicate: false,
          alreadyProcessed: true,
          event,
          payment,
        };
      }

      if (payment.status === 'FAILED') {
        throw ApiError.conflict('Failed payment cannot be marked successful', {
          code: 'PAYMENT_STATE_CONFLICT',
        });
      }

      const { data: updatedPayment, error: updatePaymentError } =
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'SUCCESS',
            paid_at: new Date().toISOString(),
          })
          .eq('id', payment.id)
          .eq('status', 'PENDING')
          .select('*')
          .single();

      if (updatePaymentError) {
        throw ApiError.internal('Unable to update payment status', {
          code: 'PAYMENT_SUCCESS_UPDATE_FAILED',
          details: updatePaymentError.message,
        });
      }

      await bookingService.markPaymentSuccess(payment.booking_id);

      await supabaseAdmin
        .from('webhook_events')
        .update({
          status: 'PROCESSED',
          processed_at: new Date().toISOString(),
        })
        .eq('id', event.id);

      info({
        event: LOG_EVENTS.WEBHOOK_PROCESSED,
        message: 'Payment success webhook processed',
        metadata: {
          eventId: event_id,
          paymentId: payment.id,
          bookingId: payment.booking_id,
        },
      });

      info({
        event: LOG_EVENTS.PAYMENT_SUCCESS,
        message: 'Payment processed successfully',
        metadata: {
          paymentId: payment.id,
          bookingId: payment.booking_id,
        },
      });

      return {
        duplicate: false,
        event: {
          ...event,
          status: 'PROCESSED',
        },
        payment: updatedPayment,
      };
    }

    if (payment.status === 'SUCCESS') {
      throw ApiError.conflict('Successful payment cannot be marked failed', {
        code: 'PAYMENT_STATE_CONFLICT',
      });
    }

    const { data: updatedPayment, error: updatePaymentError } =
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'FAILED',
          paid_at: null,
        })
        .eq('id', payment.id)
        .eq('status', 'PENDING')
        .select('*')
        .single();

    if (updatePaymentError) {
      throw ApiError.internal('Unable to update payment status', {
        code: 'PAYMENT_FAILED_UPDATE_FAILED',
        details: updatePaymentError.message,
      });
    }

    await bookingService.markPaymentFailed(payment.booking_id);

    await supabaseAdmin
      .from('webhook_events')
      .update({
        status: 'PROCESSED',
        processed_at: new Date().toISOString(),
      })
      .eq('id', event.id);

    info({
      event: LOG_EVENTS.PAYMENT_FAILED,
      message: 'Payment processing failed',
      metadata: {
        paymentId: payment.id,
        bookingId: payment.booking_id,
      },
    });

    info({
      event: LOG_EVENTS.WEBHOOK_PROCESSED,
      message: 'Payment failure webhook processed',
      metadata: {
        eventId: event_id,
        paymentId: payment.id,
      },
    });

    return {
      duplicate: false,
      event: {
        ...event,
        status: 'PROCESSED',
      },
      payment: updatedPayment,
    };
  } catch (error) {
    await supabaseAdmin
      .from('webhook_events')
      .update({
        status: 'FAILED',
      })
      .eq('id', event.id);

    logError({
      event: LOG_EVENTS.WEBHOOK_FAILED,
      message: error.message || 'Webhook processing failed',
      metadata: {
        eventId: event_id,
        eventType: event_type,
        paymentId: payment_id,
      },
    });

    throw error instanceof ApiError
      ? error
      : ApiError.internal('Webhook processing failed', {
          code: 'WEBHOOK_PROCESSING_FAILED',
        });
  }
};

module.exports = {
  processWebhook,
};
