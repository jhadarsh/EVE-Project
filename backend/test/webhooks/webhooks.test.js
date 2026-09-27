const {
  app,
  request,
  UUID,
  expectValidationError,
} = require('../helpers/api');

describe('Payment Webhook API', () => {
  test('POST /api/payments/webhook rejects an empty body', async () => {
    const response = await request(app)
      .post('/api/payments/webhook')
      .send({});

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/payments/webhook rejects an invalid payment UUID', async () => {
    const response = await request(app)
      .post('/api/payments/webhook')
      .send({
        event_id: `test-${Date.now()}`,
        event_type: 'PAYMENT_SUCCESS',
        payment_id: 'not-a-uuid',
        payload: {},
      });

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/payments/webhook passes schema validation for a structurally valid event', async () => {
    const response = await request(app)
      .post('/api/payments/webhook')
      .send({
        event_id: `test-${Date.now()}`,
        event_type: 'PAYMENT_SUCCESS',
        payment_id: UUID,
        payload: {},
      });

    // UUID is intentionally fake; service processing may reject the payment.
    expect(response.status).not.toBe(400);
  });
});
