const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw ApiError.unauthorized(
        'Authentication required',
        {
          code: 'AUTH_REQUIRED',
        }
      );
    }

    const {
      data: profile,
      error,
    } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!profile) {
      throw ApiError.forbidden(
        'User profile not found',
        {
          code: 'PROFILE_NOT_FOUND',
        }
      );
    }

    if (profile.role !== 'ADMIN') {
      throw ApiError.forbidden(
        'Administrator access required',
        {
          code: 'ADMIN_ACCESS_REQUIRED',
        }
      );
    }

    req.userProfile = profile;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireAdmin;