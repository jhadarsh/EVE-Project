const { app, request } = require('./helpers/api');

describe('Health API', () => {
  test('GET /health returns a healthy response', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: 'Backend is healthy',
        data: expect.objectContaining({
          status: 'ok',
        }),
      })
    );
  });

  test('GET /api-docs is reachable', async () => {
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger');
  });
});
