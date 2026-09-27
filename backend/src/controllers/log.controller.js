const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');
const asyncHandler = require('../utils/async-handler');
const ApiResponse = require('../utils/api-response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const listLogs = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.validated.query);

  let query = supabaseAdmin
    .from('backend_logs')
    .select(
      'id, event_type, severity, message, user_id, metadata, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (req.validated.query.event_type) {
    query = query.eq(
      'event_type',
      req.validated.query.event_type
    );
  }

  if (req.validated.query.severity) {
    query = query.eq(
      'severity',
      req.validated.query.severity
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw ApiError.internal('Unable to retrieve backend logs', {
      code: 'LOG_LIST_FAILED',
      details: error.message,
    });
  }

  return ApiResponse.success({
    res,
    message: 'Backend logs retrieved successfully',
    data: data || [],
    meta: getPaginationMeta({
      page,
      limit,
      total: count || 0,
    }),
  });
});

module.exports = {
  listLogs,
};
