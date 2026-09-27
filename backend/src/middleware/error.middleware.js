const config = require('../config/env');
const ApiError = require('../utils/api-error');
const { error: logError } = require('../logger/logger');
const LOG_EVENTS = require('../logger/log-events');

const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  return ApiError.internal(
    'Internal server error',
    {
      details:
        config.nodeEnv === 'development'
          ? error.message
          : null,
    }
  );
};

const errorMiddleware = (err, req, res, next) => {
  const error = normalizeError(err);

  const statusCode = error.statusCode || 500;

  logError({
    event:
      error.statusCode >= 400 &&
      error.statusCode < 500
        ? LOG_EVENTS.VALIDATION_ERROR
        : LOG_EVENTS.INTERNAL_ERROR,

    message: error.message,

    userId: req.user?.id || null,

    metadata: {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code: error.code,
    },
  });

  const response = {
    success: false,
    message: error.message,
  };

  if (error.code) {
    response.code = error.code;
  }

  if (
    error.details &&
    config.nodeEnv === 'development'
  ) {
    response.details = error.details;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;