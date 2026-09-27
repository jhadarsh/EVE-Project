const {
  app,
  request,
  UUID,
  expectValidationError,
  expectUnauthorized,
} = require('../helpers/api');

describe('Bookings API', () => {
  test('GET /api/bookings requires authentication', async () => {
    const response = await request(app).get('/api/bookings');
    expectUnauthorized(response);
  });

  test('GET /api/bookings rejects invalid pagination', async () => {
    const response = await request(app)
      .get('/api/bookings')
      .query({ page: 'abc' });

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/bookings/:bookingId rejects an invalid UUID', async () => {
    const response = await request(app)
      .get('/api/bookings/not-a-uuid');

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/bookings/:bookingId requires authentication', async () => {
    const response = await request(app).get(`/api/bookings/${UUID}`);
    expectUnauthorized(response);
  });

  test('POST /api/bookings rejects an empty booking payload', async () => {
    const response = await request(app).post('/api/bookings').send({});
    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/bookings rejects duplicate test IDs', async () => {
    const response = await request(app).post('/api/bookings').send({
      centre_id: UUID,
      slot_id: UUID,
      patient_name: 'Test Patient',
      patient_dob: '2000-01-01',
      patient_phone: '9876543210',
      patient_email: 'patient@example.com',
      test_ids: [UUID, UUID],
    });

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/bookings/:bookingId/cancel rejects an invalid UUID', async () => {
    const response = await request(app)
      .post('/api/bookings/not-a-uuid/cancel')
      .send({ reason: 'Testing cancellation' });

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/bookings/:bookingId/cancel requires authentication', async () => {
    const response = await request(app)
      .post(`/api/bookings/${UUID}/cancel`)
      .send({ reason: 'Testing cancellation' });

    expectUnauthorized(response);
  });
});
