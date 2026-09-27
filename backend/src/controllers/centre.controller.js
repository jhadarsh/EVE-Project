const asyncHandler = require('../utils/async-handler');
const ApiResponse = require('../utils/api-response');
const centreService = require('../services/centre.service');

const listCentres = asyncHandler(async (req, res) => {
  const result = await centreService.listCentres(req.validated.query);

  return ApiResponse.success({
    res,
    message: 'Diagnostic centres retrieved successfully',
    data: result.items,
    meta: result.meta,
  });
});

const getCentre = asyncHandler(async (req, res) => {
  const centre = await centreService.getCentre(
    req.validated.params.centreId
  );

  return ApiResponse.success({
    res,
    message: 'Diagnostic centre retrieved successfully',
    data: centre,
  });
});

const createCentre = asyncHandler(async (req, res) => {
  const centre = await centreService.createCentre(
    req.validated.body,
    req.user.id
  );

  return ApiResponse.created({
    res,
    message: 'Diagnostic centre created successfully',
    data: centre,
  });
});

const updateCentre = asyncHandler(async (req, res) => {
  const centre = await centreService.updateCentre(
    req.validated.params.centreId,
    req.validated.body,
    req.user.id
  );

  return ApiResponse.success({
    res,
    message: 'Diagnostic centre updated successfully',
    data: centre,
  });
});

const listCentreTests = asyncHandler(async (req, res) => {
  const result = await centreService.listCentreTests(
    req.validated.params.centreId,
    req.validated.query
  );

  return ApiResponse.success({
    res,
    message: 'Centre tests retrieved successfully',
    data: result.items,
    meta: result.meta,
  });
});

const listCentreSlots = asyncHandler(async (req, res) => {
  const result = await centreService.listCentreSlots(
    req.validated.params.centreId,
    req.validated.query
  );

  return ApiResponse.success({
    res,
    message: 'Appointment slots retrieved successfully',
    data: result.items,
    meta: result.meta,
  });
});

const addCentreTest = asyncHandler(async (req, res) => {
  const result = await centreService.addCentreTest(
    req.validated.params.centreId,
    req.validated.body,
    req.user.id
  );

  return ApiResponse.created({
    res,
    message: 'Test added to centre successfully',
    data: result,
  });
});

const createSlot = asyncHandler(async (req, res) => {
  const result = await centreService.createSlot(
    req.validated.params.centreId,
    req.validated.body,
    req.user.id
  );

  return ApiResponse.created({
    res,
    message: 'Appointment slot created successfully',
    data: result,
  });
});

module.exports = {
  listCentres,
  getCentre,
  createCentre,
  updateCentre,
  listCentreTests,
  listCentreSlots,
  addCentreTest,
  createSlot,
};
