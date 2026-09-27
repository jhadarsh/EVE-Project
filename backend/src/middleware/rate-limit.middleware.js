const rateLimit = require('express-rate-limit');

const createRateLimiter = ({
  windowMs,
  limit,
  message,
}) => {
  return rateLimit({
    windowMs,
    limit,

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message:
          message ||
          'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    },
  });
};

const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message:
    'Too many requests. Please try again later.',
});

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message:
    'Too many authentication attempts. Please try again later.',
});

const bookingRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message:
    'Too many booking requests. Please try again later.',
});

const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message:
    'Too many payment requests. Please try again later.',
});

module.exports = {
  createRateLimiter,
  generalRateLimiter,
  authRateLimiter,
  bookingRateLimiter,
  paymentRateLimiter,
};