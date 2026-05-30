const asyncHandler = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const FleetVehicle = require('../models/FleetVehicle');

exports.getFleet = asyncHandler(async (req, res) => {
  const vehicles = await FleetVehicle.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
  success(res, vehicles);
});

exports.getAllFleetAdmin = asyncHandler(async (req, res) => {
  const vehicles = await FleetVehicle.find().sort({ sortOrder: 1, createdAt: 1 });
  success(res, vehicles);
});

exports.createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await FleetVehicle.create(req.body);
  created(res, vehicle, 'Vehicle added');
});

exports.updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await FleetVehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!vehicle) return error(res, 'Vehicle not found', 404);
  success(res, vehicle, 'Vehicle updated');
});

exports.deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await FleetVehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) return error(res, 'Vehicle not found', 404);
  success(res, null, 'Vehicle deleted');
});
