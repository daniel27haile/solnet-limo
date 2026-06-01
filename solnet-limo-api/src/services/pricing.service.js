const PricingSetting = require('../models/PricingSetting');
const mapsService = require('./maps.service');

const getActivePricing = async () => {
  const setting = await PricingSetting.findOne({ isActive: true }).sort({ updatedAt: -1 });
  if (!setting) {
    throw new Error('No active pricing settings found. Please configure pricing in the admin panel.');
  }
  return setting;
};

const calculateFromDistance = async (distanceMiles) => {
  const pricing = await getActivePricing();

  const pricingType = distanceMiles <= pricing.mileageThreshold ? 'short-distance' : 'long-distance';
  const rateUsed = pricingType === 'short-distance' ? pricing.shortDistanceRate : pricing.longDistanceRate;
  const estimatedTotal = parseFloat((distanceMiles * rateUsed).toFixed(2));

  return {
    distanceMiles,
    mileageThreshold: pricing.mileageThreshold,
    rateUsed,
    pricingType,
    estimatedTotal,
    currency: pricing.currency,
  };
};

const calculateForTrip = async (pickupLocation, dropoffLocation) => {
  const { distanceMiles, durationText, pickupResolvedAddress, dropoffResolvedAddress } =
    await mapsService.calculateDistance(pickupLocation, dropoffLocation);

  const priceData = await calculateFromDistance(distanceMiles);

  return {
    ...priceData,
    durationText,
    pickupResolvedAddress,
    dropoffResolvedAddress,
  };
};

const updateSettings = async (data, adminEmail) => {
  const existing = await PricingSetting.findOne({ isActive: true });
  if (existing) {
    return PricingSetting.findByIdAndUpdate(
      existing._id,
      { ...data, updatedBy: adminEmail },
      { new: true, runValidators: true }
    );
  }
  return PricingSetting.create({ ...data, updatedBy: adminEmail });
};

module.exports = { getActivePricing, calculateFromDistance, calculateForTrip, updateSettings };
