const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authRateLimiter } = require('../middleware/rate-limit.middleware');

const {
  signupSchema,
  loginSchema,
  verifySchema,
  resendVerificationSchema,
  logoutSchema,
} = require('../validators/auth.validator');

const {
  signup,
  login,
  verifyEmail,
  resendVerification,
  me,
  logout,
} = require('../controllers/auth.controller');

router.post('/signup', authRateLimiter, validate(signupSchema), signup);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/verify', authRateLimiter, validate(verifySchema), verifyEmail);
router.post('/resend-verification', authRateLimiter, validate(resendVerificationSchema), resendVerification);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, validate(logoutSchema), logout);

module.exports = router;
