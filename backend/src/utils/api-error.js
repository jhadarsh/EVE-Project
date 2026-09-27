class ApiError extends Error {
  constructor(
    statusCode,
    message,
    options = {}
  ) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;

    this.code = options.code || null;
    this.details = options.details || null;

    this.isOperational =
      options.isOperational !== undefined
        ? options.isOperational
        : true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', options = {}) {
    return new ApiError(400, message, options);
  }

  static unauthorized(
    message = 'Authentication required',
    options = {}
  ) {
    return new ApiError(401, message, options);
  }

  static forbidden(
    message = 'You do not have permission to perform this action',
    options = {}
  ) {
    return new ApiError(403, message, options);
  }

  static notFound(
    message = 'Resource not found',
    options = {}
  ) {
    return new ApiError(404, message, options);
  }

  static conflict(
    message = 'Resource conflict',
    options = {}
  ) {
    return new ApiError(409, message, options);
  }

  static unprocessableEntity(
    message = 'Unable to process the request',
    options = {}
  ) {
    return new ApiError(422, message, options);
  }

  static tooManyRequests(
    message = 'Too many requests',
    options = {}
  ) {
    return new ApiError(429, message, options);
  }

  static internal(
    message = 'Internal server error',
    options = {}
  ) {
    return new ApiError(500, message, {
      ...options,
      isOperational: false,
    });
  }
}

module.exports = ApiError;