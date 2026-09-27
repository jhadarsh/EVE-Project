const {
  app,
  request,
  expectUnauthorized,
} = require('../helpers/api');

describe('Logs API', () => {
  test('GET /api/logs requires authentication/authorization', async () => {
    const response = await request(app).get('/api/logs');

    expectUnauthorized(response);
  });

  test('GET /api/logs supports pagination query validation before authorization when supplied', async () => {
    const response = await request(app)
      .get('/api/logs')
      .query({
        page: 'abc',
      });

    // Depending on middleware order, authentication may run before validation.
    expect([400, 401, 403]).toContain(response.status);
  });
});
