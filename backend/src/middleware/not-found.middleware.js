const ApiError = require('../utils/api-error');

const notFoundMiddleware = (req, res, next) => {
  next(
    ApiError.notFound(
      `Route not found: ${req.method} ${req.originalUrl}`,
      {
        code: 'ROUTE_NOT_FOUND',
      }
    )
  );
};

module.exports = notFoundMiddleware;