const asyncHandler = require('../utils/async-handler');
const ApiResponse = require('../utils/api-response');

const slotService = require('../services/slot.service');


const createSlots = asyncHandler(
  async (req, res) => {

    const slots =
      await slotService.createSlots(
        req.validated.params.centreId,
        req.validated.body
      );

    return ApiResponse.created({
      res,
      message: 'Appointment slots created successfully',
      data: slots,
    });
  }
);


const listCentreSlots = asyncHandler(
  async (req, res) => {

    const slots =
      await slotService.listCentreSlots(
        req.validated.params.centreId,
        req.validated.query.date
      );

    return ApiResponse.success({
      res,
      message: 'Appointment slots retrieved successfully',
      data: slots,
    });
  }
);


const getSlot = asyncHandler(
  async (req, res) => {

    const slot =
      await slotService.getSlot(
        req.validated.params.slotId
      );

    return ApiResponse.success({
      res,
      message: 'Appointment slot retrieved successfully',
      data: slot,
    });
  }
);


const updateSlot = asyncHandler(
  async (req, res) => {

    const slot =
      await slotService.updateSlot(
        req.validated.params.slotId,
        req.validated.body
      );

    return ApiResponse.success({
      res,
      message: 'Appointment slot updated successfully',
      data: slot,
    });
  }
);


const deleteSlot = asyncHandler(
  async (req, res) => {

    const slot =
      await slotService.deleteSlot(
        req.validated.params.slotId
      );

    return ApiResponse.success({
      res,
      message: 'Appointment slot deactivated successfully',
      data: slot,
    });
  }
);


module.exports = {
  createSlots,
  listCentreSlots,
  getSlot,
  updateSlot,
  deleteSlot,
};