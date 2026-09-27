const {
  app,
  request,
  UUID,
  expectValidationError,
} = require('../helpers/api');

describe('Tests API', () => {
  test('GET /api/tests returns the public test list', async () => {
    const response = await request(app).get('/api/tests');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/tests supports valid pagination', async () => {
    const response = await request(app)
      .get('/api/tests')
      .query({ page: '1', limit: '10' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/tests rejects invalid pagination', async () => {
    const response = await request(app)
      .get('/api/tests')
      .query({ limit: 'invalid' });

    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/tests/:testId rejects an invalid UUID', async () => {
    const response = await request(app).get('/api/tests/not-a-uuid');
    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/tests/:testId reaches the service for a valid UUID', async () => {
    const response = await request(app).get(`/api/tests/${UUID}`);
    expect([200, 404]).toContain(response.status);
  });

  test('POST /api/tests requires authentication/authorization', async () => {
    const response = await request(app).post('/api/tests').send({
      name: 'Test Diagnostic Test',
      description: 'Test description',
      information: 'Test information',
    });

    expect([401, 403]).toContain(response.status);
  });
});
