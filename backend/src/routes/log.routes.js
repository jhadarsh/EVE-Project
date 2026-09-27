const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');
const validate = require('../middleware/validate.middleware');
const { centreListSchema } = require('../validators/centre.validator');

const { listLogs } = require('../controllers/log.controller');

router.get(
  '/',
  authenticate,
  requireAdmin,
  validate(centreListSchema),
  listLogs
);

module.exports = router;
