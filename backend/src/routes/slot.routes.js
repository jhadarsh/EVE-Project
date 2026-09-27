const express = require('express');

const router = express.Router();

const authenticate =
  require('../middleware/auth.middleware');

const validate =
  require('../middleware/validate.middleware');

const {
  createSlotsSchema,
  listCentreSlotsSchema,
  slotIdParamSchema,
  updateSlotSchema,
  deleteSlotSchema,
} = require('../validators/slot.validator');

const {
  createSlots,
  listCentreSlots,
  getSlot,
  updateSlot,
  deleteSlot,
} = require('../controllers/slot.controller');


router.use(authenticate);


// Create slots for centre
router.post(
  '/centres/:centreId/slots',
  validate(createSlotsSchema),
  createSlots
);


// Get centre slots
router.get(
  '/centres/:centreId/slots',
  validate(listCentreSlotsSchema),
  listCentreSlots
);


// Get single slot
router.get(
  '/slots/:slotId',
  validate(slotIdParamSchema),
  getSlot
);


// Update slot
router.patch(
  '/slots/:slotId',
  validate(updateSlotSchema),
  updateSlot
);


// Deactivate slot
router.delete(
  '/slots/:slotId',
  validate(deleteSlotSchema),
  deleteSlot
);


module.exports = router;