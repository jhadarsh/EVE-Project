const asyncHandler = require('../utils/async-handler');
const ApiResponse = require('../utils/api-response');
const bookingService = require('../services/booking.service');
const emailService = require('../services/email.service');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(
    req.validated.body,
    req.user.id
  );

  return ApiResponse.created({
    res,
    message: 'Booking created successfully',
    data: booking,
  });
});

const listBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listBookings(
    req.user.id,
    req.validated.query
  );

  return ApiResponse.success({
    res,
    message: 'Bookings retrieved successfully',
    data: result.items,
    meta: result.meta,
  });
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(
    req.validated.params.bookingId,
    req.user.id
  );

  return ApiResponse.success({
    res,
    message: 'Booking retrieved successfully',
    data: booking,
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(
    req.validated.params.bookingId,
    req.user.id,
    req.validated.body.reason ?? null
  );

  return ApiResponse.success({
    res,
    message: 'Booking cancelled successfully',
    data: booking,
  });
});

const resendConfirmation = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(
    req.validated.params.bookingId,
    req.user.id
  );

  const result = await emailService.sendBookingConfirmation({ booking });

  return ApiResponse.success({
    res,
    message: result.sent
      ? 'Booking confirmation email sent'
      : 'Booking confirmation email prepared',
    data: result,
  });
});

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
  resendConfirmation,
};
