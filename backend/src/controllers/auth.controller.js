const asyncHandler = require('../utils/async-handler');
const ApiResponse = require('../utils/api-response');
const authService = require('../services/auth.service');

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.validated.body);

  return ApiResponse.created({
    res,
    message: 'Account created successfully',
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body);

  return ApiResponse.success({
    res,
    message: 'Login successful',
    data: result,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.validated.body);

  return ApiResponse.success({
    res,
    message: 'Email verified successfully',
    data: result,
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.validated.body);

  return ApiResponse.success({
    res,
    message: 'Verification email sent',
    data: result,
  });
});

const me = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser({
    userId: req.user.id,
  });

  return ApiResponse.success({
    res,
    message: 'Current user retrieved successfully',
    data: result,
  });
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout({
    userId: req.user.id,
  });

  return ApiResponse.success({
    res,
    message: 'Logout successful',
    data: result,
  });
});

module.exports = {
  signup,
  login,
  verifyEmail,
  resendVerification,
  me,
  logout,
};
