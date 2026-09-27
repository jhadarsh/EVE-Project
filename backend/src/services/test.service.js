const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/api-error');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { info } = require('../logger/logger');
const LOG_EVENTS = require('../logger/log-events');

const listTests = async (queryParams = {}) => {
  const { page, limit, offset } = getPagination(queryParams);

  let query = supabaseAdmin
    .from('tests')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (queryParams.search) {
    const search = queryParams.search.replace(/,/g, '');
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw ApiError.internal('Unable to retrieve tests', {
      code: 'TEST_LIST_FAILED',
      details: error.message,
    });
  }

  return {
    items: data || [],
    meta: getPaginationMeta({ page, limit, total: count || 0 }),
  };
};

const getTest = async (testId, includeInactive = false) => {
  let query = supabaseAdmin
    .from('tests')
    .select('*')
    .eq('id', testId);

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw ApiError.internal('Unable to retrieve test', {
      code: 'TEST_LOOKUP_FAILED',
      details: error.message,
    });
  }

  if (!data) {
    throw ApiError.notFound('Diagnostic test not found', {
      code: 'TEST_NOT_FOUND',
    });
  }

  return data;
};

const createTest = async (payload, adminUserId) => {
  const { data, error } = await supabaseAdmin
    .from('tests')
    .insert({
      name: payload.name,
      description: payload.description ?? null,
      information: payload.information ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw ApiError.internal('Unable to create diagnostic test', {
      code: 'TEST_CREATE_FAILED',
      details: error.message,
    });
  }

  info({
    event: LOG_EVENTS.ADMIN_ACTION,
    message: 'Diagnostic test created',
    userId: adminUserId,
    metadata: { testId: data.id },
  });

  return data;
};

const updateTest = async (testId, payload, adminUserId) => {
  await getTest(testId, true);

  const { data, error } = await supabaseAdmin
    .from('tests')
    .update(payload)
    .eq('id', testId)
    .select('*')
    .single();

  if (error) {
    throw ApiError.internal('Unable to update diagnostic test', {
      code: 'TEST_UPDATE_FAILED',
      details: error.message,
    });
  }

  info({
    event: LOG_EVENTS.ADMIN_ACTION,
    message: 'Diagnostic test updated',
    userId: adminUserId,
    metadata: { testId },
  });

  return data;
};

const getCentreTest = async (centreId, testId) => {
  const { data, error } = await supabaseAdmin
    .from('centre_tests')
    .select(
      `
      id,
      centre_id,
      test_id,
      price,
      is_available,
      tests!inner (
        id,
        name,
        description,
        information,
        is_active
      )
      `
    )
    .eq('centre_id', centreId)
    .eq('test_id', testId)
    .maybeSingle();

  if (error) {
    throw ApiError.internal('Unable to retrieve centre test', {
      code: 'CENTRE_TEST_LOOKUP_FAILED',
      details: error.message,
    });
  }

  if (!data || !data.is_available || !data.tests?.is_active) {
    throw ApiError.badRequest('Selected test is not available at this centre', {
      code: 'TEST_UNAVAILABLE_AT_CENTRE',
    });
  }

  return data;
};

const listTestCentres = async (testId, queryParams = {}) => {
  const test = await getTest(testId);

  const { page, limit, offset } = getPagination(queryParams);

  const { data, error, count } = await supabaseAdmin
    .from('centre_tests')
    .select(
      `
      id,
      centre_id,
      test_id,
      price,
      is_available,
      created_at,
      updated_at,
      diagnostic_centres!inner (
        id,
        name,
        location,
        address,
        description,
        is_active
      )
      `,
      { count: 'exact' }
    )
    .eq('test_id', test.id)
    .eq('is_available', true)
    .eq('diagnostic_centres.is_active', true)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw ApiError.internal('Unable to retrieve centres for test', {
      code: 'TEST_CENTRES_LOOKUP_FAILED',
      details: error.message,
    });
  }

  return {
    items: data || [],
    meta: getPaginationMeta({
      page,
      limit,
      total: count || 0,
    }),
  };
};

module.exports = {
  listTests,
  getTest,
  createTest,
  updateTest,
  getCentreTest,
  listTestCentres,
};
