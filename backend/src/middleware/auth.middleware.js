const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');

const extractBearerToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');

  if (
    scheme?.toLowerCase() !== 'bearer' ||
    !token
  ) {
    return null;
  }

  return token.trim();
};

const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw ApiError.unauthorized(
        'Authentication required',
        {
          code: 'AUTH_TOKEN_REQUIRED',
        }
      );
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw ApiError.unauthorized(
        'Invalid or expired authentication token',
        {
          code: 'AUTH_TOKEN_INVALID',
        }
      );
    }

    req.user = user;
    req.accessToken = token;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;