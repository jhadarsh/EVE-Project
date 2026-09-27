const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { bookingRateLimiter } = require("../middleware/rate-limit.middleware");

const {
  createBookingSchema,
  bookingIdParamSchema,
  bookingListSchema,
  cancelBookingSchema,
} = require("../validators/booking.validator");

const {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
} = require("../controllers/booking.controller");

router.use(authenticate);

router.post(
  "/",
  bookingRateLimiter,
  validate(createBookingSchema),
  createBooking,
);
router.get("/", validate(bookingListSchema), listBookings);
router.get("/:bookingId", validate(bookingIdParamSchema), getBooking);
router.post(
  "/:bookingId/cancel",
  bookingRateLimiter,
  validate(cancelBookingSchema),
  cancelBooking,
);

module.exports = router;
