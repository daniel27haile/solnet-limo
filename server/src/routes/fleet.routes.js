const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fleet.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', ctrl.getFleet);
router.get('/admin', protect, ctrl.getAllFleetAdmin);
router.post('/', protect, ctrl.createVehicle);
router.patch('/:id', protect, ctrl.updateVehicle);
router.delete('/:id', protect, ctrl.deleteVehicle);

module.exports = router;
