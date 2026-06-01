'use strict';

jest.mock('../../models/PricingSetting');
jest.mock('../../services/maps.service');

const PricingSetting = require('../../models/PricingSetting');
const mapsService = require('../../services/maps.service');
const pricingService = require('../../services/pricing.service');

const mockPricing = {
  _id: 'pricing-id-1',
  isActive: true,
  mileageThreshold: 50,
  shortDistanceRate: 3.5,
  longDistanceRate: 2.8,
  currency: 'USD',
  updatedBy: 'admin@test.com',
};

describe('pricingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivePricing()', () => {
    it('returns the active pricing setting', async () => {
      PricingSetting.findOne = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPricing),
      });

      const result = await pricingService.getActivePricing();
      expect(result).toEqual(mockPricing);
      expect(PricingSetting.findOne).toHaveBeenCalledWith({ isActive: true });
    });

    it('throws when no active pricing is found', async () => {
      PricingSetting.findOne = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      await expect(pricingService.getActivePricing()).rejects.toThrow(
        'No active pricing settings found'
      );
    });
  });

  describe('calculateFromDistance()', () => {
    beforeEach(() => {
      PricingSetting.findOne = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPricing),
      });
    });

    it('uses short-distance rate when distance <= threshold', async () => {
      const result = await pricingService.calculateFromDistance(30);
      expect(result.pricingType).toBe('short-distance');
      expect(result.rateUsed).toBe(3.5);
      expect(result.estimatedTotal).toBe(parseFloat((30 * 3.5).toFixed(2)));
      expect(result.distanceMiles).toBe(30);
      expect(result.currency).toBe('USD');
    });

    it('uses long-distance rate when distance > threshold', async () => {
      const result = await pricingService.calculateFromDistance(80);
      expect(result.pricingType).toBe('long-distance');
      expect(result.rateUsed).toBe(2.8);
      expect(result.estimatedTotal).toBe(parseFloat((80 * 2.8).toFixed(2)));
    });

    it('uses short-distance rate exactly at threshold boundary', async () => {
      const result = await pricingService.calculateFromDistance(50);
      expect(result.pricingType).toBe('short-distance');
    });

    it('returns all required fields', async () => {
      const result = await pricingService.calculateFromDistance(10);
      expect(result).toMatchObject({
        distanceMiles: 10,
        mileageThreshold: 50,
        rateUsed: expect.any(Number),
        pricingType: expect.stringMatching(/^(short|long)-distance$/),
        estimatedTotal: expect.any(Number),
        currency: 'USD',
      });
    });

    it('rounds estimatedTotal to 2 decimal places', async () => {
      const result = await pricingService.calculateFromDistance(7);
      // 7 * 3.5 = 24.5 — already 2dp
      expect(result.estimatedTotal).toBe(24.5);
      const decimals = result.estimatedTotal.toString().split('.')[1] || '';
      expect(decimals.length).toBeLessThanOrEqual(2);
    });
  });

  describe('calculateForTrip()', () => {
    it('combines maps distance with pricing calculation', async () => {
      mapsService.calculateDistance.mockResolvedValue({
        distanceMiles: 25,
        durationText: '30 mins',
        pickupResolvedAddress: '123 Main St, Denver, CO',
        dropoffResolvedAddress: '456 Elm St, Boulder, CO',
      });
      PricingSetting.findOne = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPricing),
      });

      const result = await pricingService.calculateForTrip('123 Main St', '456 Elm St');
      expect(result.durationText).toBe('30 mins');
      expect(result.pickupResolvedAddress).toBe('123 Main St, Denver, CO');
      expect(result.dropoffResolvedAddress).toBe('456 Elm St, Boulder, CO');
      expect(result.distanceMiles).toBe(25);
      expect(result.pricingType).toBe('short-distance');
    });

    it('propagates mapsService error', async () => {
      mapsService.calculateDistance.mockRejectedValue(
        new Error('One or both addresses could not be found')
      );

      await expect(
        pricingService.calculateForTrip('bad address', 'also bad')
      ).rejects.toThrow('One or both addresses could not be found');
    });
  });

  describe('updateSettings()', () => {
    const newData = { mileageThreshold: 60, shortDistanceRate: 4.0, longDistanceRate: 3.0, currency: 'USD' };

    it('updates existing active settings', async () => {
      const updated = { ...mockPricing, ...newData };
      PricingSetting.findOne = jest.fn().mockResolvedValue(mockPricing);
      PricingSetting.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

      const result = await pricingService.updateSettings(newData, 'admin@test.com');
      expect(PricingSetting.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPricing._id,
        expect.objectContaining({ updatedBy: 'admin@test.com' }),
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updated);
    });

    it('creates new settings when none exist', async () => {
      PricingSetting.findOne = jest.fn().mockResolvedValue(null);
      PricingSetting.create = jest.fn().mockResolvedValue({ ...newData, updatedBy: 'admin@test.com' });

      const result = await pricingService.updateSettings(newData, 'admin@test.com');
      expect(PricingSetting.create).toHaveBeenCalledWith(
        expect.objectContaining({ updatedBy: 'admin@test.com' })
      );
      expect(result).toBeDefined();
    });
  });
});
