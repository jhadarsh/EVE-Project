const {
  app,
  request,
  UUID,
  expectValidationError,
  expectUnauthorized,
} = require('../helpers/api');

describe('Payments API', () => {
  test('POST /api/payments requires authentication', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({ booking_id: UUID });

    expectUnauthorized(response);
  });

  test('POST /api/payments rejects an invalid booking ID', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({ booking_id: 'not-a-uuid' });

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/payments/:paymentId rejects an invalid UUID', async () => {
    const response = await request(app)
      .get('/api/payments/not-a-uuid');

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/payments/:paymentId requires authentication', async () => {
    const response = await request(app)
      .get(`/api/payments/${UUID}`);

    expectUnauthorized(response);
  });
});
