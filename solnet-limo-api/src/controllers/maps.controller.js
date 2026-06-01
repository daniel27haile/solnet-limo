const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const mapsService = require('../services/maps.service');

exports.calculateDistance = asyncHandler(async (req, res) => {
  const { pickupLocation, dropoffLocation } = req.body;

  if (!pickupLocation || !dropoffLocation) {
    return error(res, 'Both pickupLocation and dropoffLocation are required', 400);
  }

  const result = await mapsService.calculateDistance(pickupLocation, dropoffLocation);
  success(res, result);
});
