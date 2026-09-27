const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');
const { info } = require('../logger/logger');
const LOG_EVENTS = require('../logger/log-events');
const bookingService = require('./booking.service');

const createPayment = async (bookingId, userId) => {
  const booking = await bookingService.getBooking(bookingId, userId);

  if (booking.status !== 'PENDING') {
    throw ApiError.conflict(
      `Payment cannot be created for a ${booking.status} booking`,
      { code: 'BOOKING_NOT_PAYABLE' }
    );
  }

  const existing = (booking.payments || []).find(
    (payment) => payment.status === 'PENDING'
  );

  if (existing) {
    return existing;
  }

  const successful = (booking.payments || []).find(
    (payment) => payment.status === 'SUCCESS'
  );

  if (successful) {
    throw ApiError.conflict('Booking has already been paid', {
      code: 'BOOKING_ALREADY_PAID',
    });
  }

  const paymentReference = `SIM-${Date.now()}-${crypto
    .randomBytes(6)
    .toString('hex')
    .toUpperCase()}`;

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      booking_id: booking.id,
      payment_reference: paymentReference,
      amount: Number(booking.total_amount),
      status: 'PENDING',
      provider: 'SIMULATED',
    })
    .select('*')
    .single();

  if (error) {
    throw ApiError.internal('Unable to create payment', {
      code: 'PAYMENT_CREATE_FAILED',
      details: error.message,
    });
  }

  info({
    event: LOG_EVENTS.PAYMENT_CREATED,
    message: 'Simulated payment created',
    userId,
    metadata: {
      paymentId: data.id,
      bookingId: booking.id,
      amount: Number(booking.total_amount),
    },
  });

  return data;
};

const getPayment = async (paymentId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select(
      `
      id,
      booking_id,
      payment_reference,
      amount,
      status,
      provider,
      paid_at,
      created_at,
      updated_at,
      bookings!inner (
        id,
        user_id,
        total_amount,
        status
      )
      `
    )
    .eq('id', paymentId)
    .eq('bookings.user_id', userId)
    .maybeSingle();

  if (error) {
    throw ApiError.internal('Unable to retrieve payment', {
      code: 'PAYMENT_LOOKUP_FAILED',
      details: error.message,
    });
  }

  if (!data) {
    throw ApiError.notFound('Payment not found', {
      code: 'PAYMENT_NOT_FOUND',
    });
  }

  return data;
};

module.exports = {
  createPayment,
  getPayment,
};
