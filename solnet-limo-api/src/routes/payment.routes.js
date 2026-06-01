const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');

router.post(
  '/create',
  [
    body('sourceId').notEmpty().withMessage('Payment source ID is required'),
    body('bookingDraft.fullName').trim().notEmpty().withMessage('Full name is required'),
    body('bookingDraft.phone').trim().notEmpty().withMessage('Phone is required'),
    body('bookingDraft.email').isEmail().withMessage('Valid email is required'),
    body('bookingDraft.pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
    body('bookingDraft.dropoffLocation').trim().notEmpty().withMessage('Drop-off location is required'),
    body('bookingDraft.serviceType').notEmpty().withMessage('Service type is required'),
    body('bookingDraft.vehicleType').trim().notEmpty().withMessage('Vehicle type is required'),
    body('bookingDraft.date').isISO8601().withMessage('Valid date is required'),
    body('bookingDraft.time').notEmpty().withMessage('Time is required'),
    body('bookingDraft.passengers').isInt({ min: 1, max: 20 }).withMessage('Passengers must be 1–20'),
  ],
  validate,
  ctrl.createPayment
);

module.exports = router;
