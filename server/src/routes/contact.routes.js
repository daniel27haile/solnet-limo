const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/contact.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

router.post('/', contactValidation, validate, ctrl.createMessage);
router.get('/', protect, ctrl.getAllMessages);
router.get('/stats', protect, ctrl.getMessageStats);
router.get('/:id', protect, ctrl.getMessageById);
router.patch('/:id/read', protect, ctrl.markAsRead);
router.delete('/:id', protect, ctrl.deleteMessage);

module.exports = router;
