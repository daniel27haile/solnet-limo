const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const pricingService = require('../services/pricing.service');

exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await pricingService.getActivePricing();
  success(res, settings);
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const { mileageThreshold, shortDistanceRate, longDistanceRate, currency } = req.body;

  if (!mileageThreshold || !shortDistanceRate || !longDistanceRate) {
    return error(res, 'mileageThreshold, shortDistanceRate, and longDistanceRate are required', 400);
  }

  const adminEmail = req.admin?.email || 'admin';
  const updated = await pricingService.updateSettings(
    { mileageThreshold, shortDistanceRate, longDistanceRate, currency },
    adminEmail
  );
  success(res, updated, 'Pricing settings updated');
});

exports.calculatePrice = asyncHandler(async (req, res) => {
  const { pickupLocation, dropoffLocation } = req.body;

  if (!pickupLocation || !dropoffLocation) {
    return error(res, 'Both pickupLocation and dropoffLocation are required', 400);
  }

  const result = await pricingService.calculateForTrip(pickupLocation, dropoffLocation);
  success(res, result);
});
