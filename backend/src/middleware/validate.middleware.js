const ApiError = require('../utils/api-error');

const validate = (schema) => {
  if (!schema || typeof schema.safeParse !== 'function') {
    throw new Error(
      'validate middleware requires a valid Zod schema'
    );
  }

  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!result.success) {
      const details = result.error.issues.map(
        (issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })
      );

      return next(
        ApiError.badRequest(
          'Request validation failed',
          {
            code: 'VALIDATION_ERROR',
            details,
          }
        )
      );
    }

    req.validated = result.data;

    next();
  };
};

module.exports = validate;