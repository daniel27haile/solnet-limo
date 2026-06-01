const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/maps.controller');
const validate = require('../middleware/validate.middleware');

router.post(
  '/calculate-distance',
  [
    body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
    body('dropoffLocation').trim().notEmpty().withMessage('Drop-off location is required'),
  ],
  validate,
  ctrl.calculateDistance
);

module.exports = router;
