const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/service.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', ctrl.getServices);
router.get('/admin', protect, ctrl.getAllServicesAdmin);
router.post('/', protect, ctrl.createService);
router.patch('/:id', protect, ctrl.updateService);
router.delete('/:id', protect, ctrl.deleteService);

module.exports = router;
