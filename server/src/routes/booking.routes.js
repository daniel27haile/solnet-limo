const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const bookingValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
  body('dropoffLocation').trim().notEmpty().withMessage('Drop-off location is required'),
  body('serviceType').notEmpty().withMessage('Service type is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('passengers').isInt({ min: 1, max: 20 }).withMessage('Passengers must be between 1 and 20'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
];

router.post('/', bookingValidation, validate, ctrl.createBooking);
router.get('/', protect, ctrl.getAllBookings);
router.get('/stats', protect, ctrl.getBookingStats);
router.get('/:id', protect, ctrl.getBookingById);
router.patch('/:id/status', protect, [body('status').notEmpty()], validate, ctrl.updateBookingStatus);
router.delete('/:id', protect, ctrl.deleteBooking);

module.exports = router;
