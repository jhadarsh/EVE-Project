const asyncHandler = require('../utils/async-handler');
const ApiResponse = require('../utils/api-response');
const testService = require('../services/test.service');

const listTests = asyncHandler(async (req, res) => {
  const result = await testService.listTests(req.validated.query);

  return ApiResponse.success({
    res,
    message: 'Diagnostic tests retrieved successfully',
    data: result.items,
    meta: result.meta,
  });
});

const getTest = asyncHandler(async (req, res) => {
  const test = await testService.getTest(
    req.validated.params.testId
  );

  return ApiResponse.success({
    res,
    message: 'Diagnostic test retrieved successfully',
    data: test,
  });
});

const createTest = asyncHandler(async (req, res) => {
  const test = await testService.createTest(
    req.validated.body,
    req.user.id
  );

  return ApiResponse.created({
    res,
    message: 'Diagnostic test created successfully',
    data: test,
  });
});

const updateTest = asyncHandler(async (req, res) => {
  const test = await testService.updateTest(
    req.validated.params.testId,
    req.validated.body,
    req.user.id
  );

  return ApiResponse.success({
    res,
    message: 'Diagnostic test updated successfully',
    data: test,
  });
});

const listTestCentres = asyncHandler(async (req, res) => {
  const result = await testService.listTestCentres(
    req.validated.params.testId,
    req.validated.query
  );

  return ApiResponse.success({
    res,
    message: 'Centres offering test retrieved successfully',
    data: result.items,
    meta: result.meta,
  });
});

module.exports = {
  listTests,
  getTest,
  createTest,
  updateTest,
  listTestCentres,
};
