const {
  app,
  request,
  UUID,
  expectValidationError,
} = require('../helpers/api');

describe('Centres API', () => {
  test('GET /api/centres returns the public centre list', async () => {
    const response = await request(app).get('/api/centres');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/centres supports valid pagination', async () => {
    const response = await request(app)
      .get('/api/centres')
      .query({ page: '1', limit: '10' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/centres rejects invalid pagination', async () => {
    const response = await request(app)
      .get('/api/centres')
      .query({ page: 'abc' });

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/centres/:centreId rejects an invalid UUID', async () => {
    const response = await request(app).get('/api/centres/not-a-uuid');
    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/centres/:centreId reaches the service for a valid UUID', async () => {
    const response = await request(app).get(`/api/centres/${UUID}`);
    expect([200, 404]).toContain(response.status);
  });

  test('GET /api/centres/:centreId/tests rejects an invalid UUID', async () => {
    const response = await request(app)
      .get('/api/centres/not-a-uuid/tests');

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/centres/:centreId/slots rejects an invalid UUID', async () => {
    const response = await request(app)
      .get('/api/centres/not-a-uuid/slots');

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/centres requires authentication/authorization', async () => {
    const response = await request(app).post('/api/centres').send({
      name: 'Test Diagnostic Centre',
      location: 'Agra',
      address: 'Test address, Agra',
      description: 'Test centre',
    });

    expect([401, 403]).toContain(response.status);
  });
});
