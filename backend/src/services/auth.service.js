const { supabase, supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');
const { info, error: logError } = require('../logger/logger');
const LOG_EVENTS = require('../logger/log-events');

const mapAuthError = (authError, fallbackMessage, context = {}) => {
  const message = authError?.message || '';
  const normalized = message.toLowerCase();

  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return ApiError.conflict('An account with this email already exists', {
      code: 'AUTH_EMAIL_EXISTS',
    });
  }

  if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
    return ApiError.unauthorized('Invalid email or password', {
      code: 'AUTH_INVALID_CREDENTIALS',
    });
  }

  if (normalized.includes('email not confirmed') || normalized.includes('email_not_confirmed')) {
    return ApiError.forbidden('Please verify your email before logging in', {
      code: 'AUTH_EMAIL_NOT_VERIFIED',
    });
  }

  if (normalized.includes('expired') && normalized.includes('otp')) {
    return ApiError.badRequest('Verification code has expired', {
      code: 'AUTH_VERIFICATION_EXPIRED',
    });
  }

  if (
    normalized.includes('invalid') &&
    (normalized.includes('otp') || normalized.includes('token') || normalized.includes('verification'))
  ) {
    return ApiError.badRequest('Invalid verification code', {
      code: 'AUTH_VERIFICATION_INVALID',
    });
  }

  // Supabase rate-limits repeat signup/resend attempts to the same address,
  // e.g. "For security purposes, you can only request this after 42 seconds."
  // This was previously falling into the generic bucket below with no way
  // to tell it apart from a real failure.
  if (normalized.includes('security purposes') || (normalized.includes('rate limit') && normalized.includes('email'))) {
    return ApiError.badRequest('Please wait a bit before trying again.', {
      code: 'AUTH_RATE_LIMITED',
    });
  }

  // Nothing matched a known case. This used to be a dead end - the real
  // Supabase message was discarded and replaced with the generic
  // "Unable to create/log in" text, making it impossible to tell what
  // actually went wrong from the logs. Log it now so future occurrences
  // are diagnosable.
  logError({
    event: LOG_EVENTS.AUTH_FAILURE,
    message: 'Unmapped Supabase auth error',
    metadata: {
      ...context,
      supabaseMessage: message,
      supabaseStatus: authError?.status ?? null,
      supabaseCode: authError?.code ?? null,
    },
  });

  return ApiError.badRequest(fallbackMessage, {
    code: 'AUTHENTICATION_ERROR',
  });
};

const signup = async ({ email, password, full_name, phone }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (error) {
    throw mapAuthError(error, 'Unable to create account', { operation: 'signup', email });
  }

  if (!data?.user) {
    throw ApiError.internal('Unable to create account', {
      code: 'AUTH_SIGNUP_FAILED',
    });
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ phone })
    .eq('id', data.user.id);

  if (profileError) {
    logError({
      event: LOG_EVENTS.AUTH_FAILURE,
      message: 'User created but profile update failed',
      userId: data.user.id,
      metadata: { operation: 'signup_profile_update', supabaseMessage: profileError.message },
    });
    throw ApiError.internal('Account creation could not be completed', {
      code: 'AUTH_PROFILE_UPDATE_FAILED',
    });
  }

  info({
    event: LOG_EVENTS.AUTH_SIGNUP,
    message: 'User account created successfully',
    userId: data.user.id,
    metadata: { email: data.user.email },
  });

  return {
    user: data.user,
    session: data.session,
    emailConfirmed: Boolean(data.user.email_confirmed_at),
  };
};

const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw mapAuthError(error, 'Unable to log in', { operation: 'login', email });
  }

  if (!data?.user || !data?.session) {
    throw ApiError.unauthorized('Unable to establish an authenticated session', {
      code: 'AUTH_SESSION_FAILED',
    });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, phone, role, created_at, updated_at')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    throw ApiError.internal('Unable to retrieve user profile', {
      code: 'PROFILE_LOOKUP_FAILED',
      details: profileError.message,
    });
  }

  info({
    event: LOG_EVENTS.AUTH_LOGIN,
    message: 'User logged in successfully',
    userId: data.user.id,
    metadata: { email: data.user.email },
  });

  return { user: data.user, profile, session: data.session };
};

const verifyEmail = async ({ email, token, type = 'signup' }) => {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type });

  if (error) {
    throw mapAuthError(error, 'Unable to verify email', { operation: 'verify', email, type });
  }

  if (!data?.user) {
    throw ApiError.badRequest('Email verification failed', {
      code: 'AUTH_VERIFICATION_FAILED',
    });
  }

  info({
    event: LOG_EVENTS.AUTH_VERIFICATION,
    message: 'User email verified successfully',
    userId: data.user.id,
    metadata: { verificationType: type },
  });

  return { user: data.user, session: data.session, verified: true };
};

const resendVerification = async ({ email }) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    throw mapAuthError(error, 'Unable to resend verification email', { operation: 'resend', email });
  }

  info({
    event: LOG_EVENTS.AUTH_VERIFICATION,
    message: 'Verification email resend requested',
    metadata: { email },
  });

  return { sent: true };
};

const getCurrentUser = async ({ userId }) => {
  if (!userId) {
    throw ApiError.unauthorized('Authentication required', {
      code: 'AUTH_REQUIRED',
    });
  }

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data?.user) {
    throw ApiError.unauthorized('Authenticated user could not be found', {
      code: 'AUTH_USER_NOT_FOUND',
    });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, phone, role, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw ApiError.internal('Unable to retrieve user profile', {
      code: 'PROFILE_LOOKUP_FAILED',
      details: profileError.message,
    });
  }

  if (!profile) {
    throw ApiError.notFound('User profile not found', {
      code: 'PROFILE_NOT_FOUND',
    });
  }

  return { user: data.user, profile };
};

const logout = async ({ userId }) => {
  if (!userId) {
    throw ApiError.unauthorized('Authentication required', {
      code: 'AUTH_REQUIRED',
    });
  }

  const { error } = await supabaseAdmin.auth.admin.signOut(userId, 'local');

  if (error) {
    throw ApiError.internal('Unable to log out', {
      code: 'AUTH_LOGOUT_FAILED',
      details: error.message,
    });
  }

  info({
    event: LOG_EVENTS.AUTH_LOGOUT,
    message: 'User logged out successfully',
    userId,
  });

  return { loggedOut: true };
};

module.exports = {
  signup,
  login,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  logout,
};