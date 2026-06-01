const axios = require('axios');
const env = require('../config/env');

const GOOGLE_MAPS_BASE = 'https://maps.googleapis.com/maps/api';

/**
 * Calculate driving distance between two addresses using Google Distance Matrix API.
 * Returns distance in miles, duration text, and resolved addresses.
 */
const calculateDistance = async (origin, destination) => {
  if (!env.GOOGLE_MAPS_SERVER_API_KEY) {
    throw new Error('Google Maps API is not configured on the server.');
  }

  const response = await axios.get(`${GOOGLE_MAPS_BASE}/distancematrix/json`, {
    params: {
      origins: origin,
      destinations: destination,
      units: 'imperial',
      key: env.GOOGLE_MAPS_SERVER_API_KEY,
    },
    timeout: 10000,
  });

  const data = response.data;

  if (data.status !== 'OK') {
    throw new Error(`Google Maps error: ${data.status} — ${data.error_message || 'Unknown error'}`);
  }

  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== 'OK') {
    const elementStatus = element?.status || 'UNKNOWN';
    throw new Error(
      elementStatus === 'NOT_FOUND'
        ? 'One or both addresses could not be found. Please check the addresses and try again.'
        : elementStatus === 'ZERO_RESULTS'
        ? 'No route found between the provided addresses.'
        : `Could not calculate distance: ${elementStatus}`
    );
  }

  const distanceMeters = element.distance.value;
  const distanceMiles = parseFloat((distanceMeters / 1609.344).toFixed(2));

  return {
    distanceMiles,
    durationText: element.duration.text,
    pickupResolvedAddress: data.origin_addresses?.[0] || origin,
    dropoffResolvedAddress: data.destination_addresses?.[0] || destination,
  };
};

module.exports = { calculateDistance };
