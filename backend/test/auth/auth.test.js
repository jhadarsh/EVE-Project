const {
  app,
  request,
  expectValidationError,
  expectUnauthorized,
} = require('../helpers/api');

describe('Authentication API', () => {
  test('POST /api/auth/signup rejects missing required fields', async () => {
    const response = await request(app).post('/api/auth/signup').send({});
    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/auth/signup rejects invalid email/password', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      email: 'not-an-email',
      password: '123',
      full_name: 'A',
      phone: '123',
    });
    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/auth/login rejects missing credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({});
    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/auth/login rejects invalid credential format', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'bad-email',
      password: '123',
    });
    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('POST /api/auth/verify rejects invalid verification request', async () => {
    const response = await request(app).post('/api/auth/verify').send({
      email: 'bad-email',
      token: '1',
    });
    expect(response.status).toBe(400);
    expectValidationError(response);
  });

  test('GET /api/auth/me requires authentication', async () => {
    const response = await request(app).get('/api/auth/me');
    expectUnauthorized(response);
  });

  test('POST /api/auth/logout requires authentication', async () => {
    const response = await request(app).post('/api/auth/logout').send({});
    expectUnauthorized(response);
  });
});
