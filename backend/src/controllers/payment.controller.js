const asyncHandler = require('../utils/async-handler');
const ApiResponse = require('../utils/api-response');
const paymentService = require('../services/payment.service');
const webhookService = require('../services/webhook.service');

const createPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.createPayment(
    req.validated.body.booking_id,
    req.user.id
  );

  return ApiResponse.created({
    res,
    message: 'Payment created successfully',
    data: result,
  });
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPayment(
    req.validated.params.paymentId,
    req.user.id
  );

  return ApiResponse.success({
    res,
    message: 'Payment retrieved successfully',
    data: payment,
  });
});

const webhook = asyncHandler(async (req, res) => {
  const result = await webhookService.processWebhook(req.validated.body);

  return ApiResponse.success({
    res,
    message: result.duplicate
      ? 'Webhook event already processed'
      : 'Webhook processed successfully',
    data: result,
  });
});

module.exports = {
  createPayment,
  getPayment,
  webhook,
};
