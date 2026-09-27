const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  paymentRateLimiter,
  generalRateLimiter,
} = require("../middleware/rate-limit.middleware");

const {
  paymentIdParamSchema,
  bookingPaymentSchema,
  paymentStatusSchema,
} = require("../validators/payment.validator");
const { webhookSchema } = require("../validators/webhook.validator");

const {
  createPayment,
  getPayment,
  webhook,
} = require("../controllers/payment.controller");

router.post("/webhook", generalRateLimiter, validate(webhookSchema), webhook);

router.use(authenticate);

router.post(
  "/",
  paymentRateLimiter,
  validate(bookingPaymentSchema),
  createPayment,
);
router.get("/:paymentId", validate(paymentIdParamSchema), getPayment);
router.get("/:paymentId/status", validate(paymentStatusSchema), getPayment);

module.exports = router;
