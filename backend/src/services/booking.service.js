const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { info, error: logError } = require('../logger/logger');
const LOG_EVENTS = require('../logger/log-events');
const slotService = require('./slot.service');
const centreService = require('./centre.service');

const BOOKING_SELECT = `
  id,
  user_id,
  centre_id,
  slot_id,
  patient_name,
  patient_dob,
  patient_phone,
  patient_email,
  total_amount,
  queue_number,
  status,
  created_at,
  updated_at,
  booking_tests (
    id,
    centre_test_id,
    test_name,
    unit_price,
    quantity,
    subtotal,
    created_at
  ),
  payments (
    id,
    booking_id,
    payment_reference,
    amount,
    status,
    provider,
    paid_at,
    created_at,
    updated_at
  )
`;

const getOwnedBooking = async (bookingId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', bookingId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw ApiError.internal('Unable to retrieve booking', {
      code: 'BOOKING_LOOKUP_FAILED',
      details: error.message,
    });
  }

  if (!data) {
    throw ApiError.notFound('Booking not found', {
      code: 'BOOKING_NOT_FOUND',
    });
  }

  return data;
};

const createBooking = async (payload, userId) => {
  await centreService.ensureCentre(payload.centre_id);

  const { data: centreTests, error: testsError } = await supabaseAdmin
    .from('centre_tests')
    .select(
      `
      id,
      centre_id,
      test_id,
      price,
      is_available,
      tests!inner (
        id,
        name,
        is_active
      )
      `
    )
    .eq('centre_id', payload.centre_id)
    .in('test_id', payload.test_ids);

  if (testsError) {
    throw ApiError.internal('Unable to validate selected tests', {
      code: 'BOOKING_TEST_LOOKUP_FAILED',
      details: testsError.message,
    });
  }

  if (!centreTests || centreTests.length !== payload.test_ids.length) {
    throw ApiError.badRequest(
      'One or more selected tests are not available at this centre',
      { code: 'TEST_UNAVAILABLE_AT_CENTRE' }
    );
  }

  const invalidTest = centreTests.find(
    (item) => !item.is_available || !item.tests?.is_active
  );

  if (invalidTest) {
    throw ApiError.badRequest('One or more selected tests are unavailable', {
      code: 'TEST_UNAVAILABLE_AT_CENTRE',
    });
  }

  const totalAmount = centreTests.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  const { slot, queueNumber } = await slotService.reserveSlot(
    payload.slot_id,
    payload.centre_id
  );

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .insert({
      user_id: userId,
      centre_id: payload.centre_id,
      slot_id: payload.slot_id,
      patient_name: payload.patient_name,
      patient_dob: payload.patient_dob ?? null,
      patient_phone: payload.patient_phone,
      patient_email: payload.patient_email,
      total_amount: totalAmount,
      queue_number: queueNumber,
      status: 'PENDING',
    })
    .select('*')
    .single();

  if (bookingError) {
    await slotService.releaseSlot(payload.slot_id).catch(() => {});
    throw ApiError.internal('Unable to create booking', {
      code: 'BOOKING_CREATE_FAILED',
      details: bookingError.message,
    });
  }

  const bookingTests = centreTests.map((item) => ({
    booking_id: booking.id,
    centre_test_id: item.id,
    test_name: item.tests.name,
    unit_price: Number(item.price),
    quantity: 1,
    subtotal: Number(item.price),
  }));

  const { error: bookingTestsError } = await supabaseAdmin
    .from('booking_tests')
    .insert(bookingTests);

  if (bookingTestsError) {
    await supabaseAdmin.from('bookings').delete().eq('id', booking.id);
    await slotService.releaseSlot(payload.slot_id).catch(() => {});

    throw ApiError.internal('Unable to save selected booking tests', {
      code: 'BOOKING_TESTS_CREATE_FAILED',
      details: bookingTestsError.message,
    });
  }

  info({
    event: LOG_EVENTS.BOOKING_CREATED,
    message: 'Booking created successfully',
    userId,
    metadata: {
      bookingId: booking.id,
      centreId: payload.centre_id,
      slotId: payload.slot_id,
      testCount: bookingTests.length,
      totalAmount,
    },
  });

  return getOwnedBooking(booking.id, userId);
};

const listBookings = async (userId, queryParams = {}) => {
  const { page, limit, offset } = getPagination(queryParams);

  let query = supabaseAdmin
    .from('bookings')
    .select(BOOKING_SELECT, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (queryParams.status) {
    query = query.eq('status', queryParams.status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw ApiError.internal('Unable to retrieve bookings', {
      code: 'BOOKING_LIST_FAILED',
      details: error.message,
    });
  }

  return {
    items: data || [],
    meta: getPaginationMeta({ page, limit, total: count || 0 }),
  };
};

const getBooking = async (bookingId, userId) => getOwnedBooking(bookingId, userId);

const cancelBooking = async (bookingId, userId, reason = null) => {
  const booking = await getOwnedBooking(bookingId, userId);

  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw ApiError.conflict(
      `Booking cannot be cancelled from ${booking.status} status`,
      { code: 'BOOKING_CANNOT_CANCEL' }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({
      status: 'CANCELLED',
    })
    .eq('id', bookingId)
    .eq('user_id', userId)
    .in('status', ['PENDING', 'CONFIRMED'])
    .select('*')
    .single();

  if (error || !data) {
    throw ApiError.conflict('Booking could not be cancelled', {
      code: 'BOOKING_CANCEL_FAILED',
      details: error?.message,
    });
  }

  /*
   * A cancelled appointment releases one slot capacity.
   * queue_number remains a historical position on the booking.
   */
  await slotService.releaseSlot(booking.slot_id).catch((releaseError) => {
    logError({
      event: LOG_EVENTS.INTERNAL_ERROR,
      message: 'Booking cancelled but slot capacity could not be released',
      userId,
      metadata: {
        bookingId,
        slotId: booking.slot_id,
        reason,
        error: releaseError.message,
      },
    });
  });

  info({
    event: LOG_EVENTS.BOOKING_CANCELLED,
    message: 'Booking cancelled successfully',
    userId,
    metadata: {
      bookingId,
      reason,
    },
  });

  return getOwnedBooking(bookingId, userId);
};

const markPaymentSuccess = async (bookingId) => {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'CONFIRMED' })
    .eq('id', bookingId)
    .eq('status', 'PENDING')
    .select('*')
    .maybeSingle();

  if (error) {
    throw ApiError.internal('Unable to confirm booking', {
      code: 'BOOKING_CONFIRM_FAILED',
      details: error.message,
    });
  }

  if (!data) {
    const { data: current } = await supabaseAdmin
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .maybeSingle();

    if (current?.status === 'CONFIRMED') {
      return current;
    }

    throw ApiError.conflict('Booking cannot be confirmed', {
      code: 'BOOKING_CONFIRM_INVALID_STATE',
    });
  }

  return data;
};

const markPaymentFailed = async (bookingId) => {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'FAILED' })
    .eq('id', bookingId)
    .eq('status', 'PENDING')
    .select('*')
    .maybeSingle();

  if (error) {
    throw ApiError.internal('Unable to mark booking as failed', {
      code: 'BOOKING_FAIL_UPDATE_FAILED',
      details: error.message,
    });
  }

  return data;
};

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
  markPaymentSuccess,
  markPaymentFailed,
};
