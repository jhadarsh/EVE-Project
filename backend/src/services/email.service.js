const { info } = require('../logger/logger');
const LOG_EVENTS = require('../logger/log-events');

const sendBookingConfirmation = async ({
  booking,
  payment = null,
}) => {
  /*
   * The current package.json intentionally contains no SMTP/mail provider
   * dependency. Supabase Auth handles verification emails, while booking
   * confirmation email is an optional application enhancement.
   *
   * Keep this service as the integration boundary so a mail provider can be
   * added later without changing controllers or booking/payment services.
   */
  info({
    event: LOG_EVENTS.ADMIN_ACTION,
    message: 'Booking confirmation email prepared',
    userId: booking?.user_id || null,
    metadata: {
      bookingId: booking?.id || null,
      paymentId: payment?.id || null,
      recipient: booking?.patient_email || null,
      delivery: 'NOT_CONFIGURED',
    },
  });

  return {
    sent: false,
    configured: false,
    bookingId: booking?.id || null,
  };
};

module.exports = {
  sendBookingConfirmation,
};
