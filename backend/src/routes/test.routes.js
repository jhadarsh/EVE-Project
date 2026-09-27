const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');
const validate = require('../middleware/validate.middleware');

const {
  testListSchema,
  testIdParamSchema,
  testCentresSchema,
  createTestSchema,
  updateTestSchema,
} = require('../validators/test.validator');

const {
  listTests,
  getTest,
  createTest,
  updateTest,
  listTestCentres,
} = require('../controllers/test.controller');


router.get(
  '/',
  validate(testListSchema),
  listTests
);

router.get(
  '/:testId/centres',
  validate(testCentresSchema),
  listTestCentres
);

router.get(
  '/:testId',
  validate(testIdParamSchema),
  getTest
);


router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createTestSchema),
  createTest
);

router.patch(
  '/:testId',
  authenticate,
  requireAdmin,
  validate(updateTestSchema),
  updateTest
);

module.exports = router;