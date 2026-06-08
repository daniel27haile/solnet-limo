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
  let estimatedTotal = parseFloat((distanceMiles * rateUsed).toFixed(2));

  let minimumFareApplied = false;
  const minFareEnabled = pricing.minimumFareEnabled !== false && pricing.minimumFareEnabled !== undefined
    ? pricing.minimumFareEnabled
    : false;

  if (
    minFareEnabled &&
    pricing.minimumFareAmount > 0 &&
    pricing.minimumFareDistance > 0 &&
    distanceMiles < pricing.minimumFareDistance &&
    estimatedTotal < pricing.minimumFareAmount
  ) {
    estimatedTotal = pricing.minimumFareAmount;
    minimumFareApplied = true;
  }

  return {
    distanceMiles,
    mileageThreshold: pricing.mileageThreshold,
    rateUsed,
    pricingType,
    estimatedTotal,
    currency: pricing.currency,
    minimumFareApplied,
    minimumFareAmount: pricing.minimumFareAmount || null,
    minimumFareDistance: pricing.minimumFareDistance || null,
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
