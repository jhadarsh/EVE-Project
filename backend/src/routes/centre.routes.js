const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');
const validate = require('../middleware/validate.middleware');

const {
  centreIdParamSchema,
  centreListSchema,
  createCentreSchema,
  updateCentreSchema,
  centreTestsSchema,
  addCentreTestSchema,
  centreSlotsSchema,
} = require('../validators/centre.validator');

const {
  listCentres,
  getCentre,
  createCentre,
  updateCentre,
  listCentreTests,
  listCentreSlots,
  addCentreTest,
} = require('../controllers/centre.controller');


// Public
router.get(
  '/',
  validate(centreListSchema),
  listCentres
);

router.get(
  '/:centreId',
  validate(centreIdParamSchema),
  getCentre
);

router.get(
  '/:centreId/tests',
  validate(centreTestsSchema),
  listCentreTests
);

router.get(
  '/:centreId/slots',
  validate(centreSlotsSchema),
  listCentreSlots
);


// Admin
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createCentreSchema),
  createCentre
);

router.patch(
  '/:centreId',
  authenticate,
  requireAdmin,
  validate(updateCentreSchema),
  updateCentre
);

router.post(
  '/:centreId/tests',
  authenticate,
  requireAdmin,
  validate(addCentreTestSchema),
  addCentreTest
);

module.exports = router;