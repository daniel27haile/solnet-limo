const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/pricing.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

// Public: get active settings (for frontend display)
router.get('/settings', ctrl.getSettings);

// Public: calculate price for a trip
router.post(
  '/calculate',
  [
    body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
    body('dropoffLocation').trim().notEmpty().withMessage('Drop-off location is required'),
  ],
  validate,
  ctrl.calculatePrice
);

// Admin only: update pricing settings
router.patch(
  '/settings',
  protect,
  [
    body('mileageThreshold').isFloat({ min: 1 }).withMessage('Mileage threshold must be > 0'),
    body('shortDistanceRate').isFloat({ min: 0.01 }).withMessage('Short distance rate must be > 0'),
    body('longDistanceRate').isFloat({ min: 0.01 }).withMessage('Long distance rate must be > 0'),
  ],
  validate,
  ctrl.updateSettings
);

module.exports = router;
