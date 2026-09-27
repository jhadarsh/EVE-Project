const request = require('supertest');
const app = require('../../src/app');

const UUID = '11111111-1111-4111-8111-111111111111';

const expectValidationError = (response) => {
  expect(response.body).toBeDefined();
  expect(response.body.success).toBe(false);
  expect(response.body.code).toBe('VALIDATION_ERROR');
};

const expectUnauthorized = (response) => {
  expect([401, 403]).toContain(response.status);
  expect(response.body).toBeDefined();
  expect(response.body.success).toBe(false);
};

module.exports = {
  app,
  request,
  UUID,
  expectValidationError,
  expectUnauthorized,
};
