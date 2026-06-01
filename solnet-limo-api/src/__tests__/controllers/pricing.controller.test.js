'use strict';

jest.mock('../../services/pricing.service');

const pricingService = require('../../services/pricing.service');
const pricingController = require('../../controllers/pricing.controller');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockSettings = {
  mileageThreshold: 50,
  shortDistanceRate: 3.5,
  longDistanceRate: 2.8,
  currency: 'USD',
  isActive: true,
};

describe('pricing.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings()', () => {
    it('returns 200 with pricing settings', async () => {
      pricingService.getActivePricing.mockResolvedValue(mockSettings);
      const res = mockRes();

      await pricingController.getSettings({ body: {} }, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data).toEqual(mockSettings);
    });

    it('calls next on service error', async () => {
      pricingService.getActivePricing.mockRejectedValue(new Error('No settings'));
      const next = jest.fn();

      await pricingController.getSettings({}, mockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateSettings()', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = mockRes();
      await pricingController.updateSettings(
        { body: { mileageThreshold: 50 }, admin: { email: 'a@b.com' } },
        res,
        jest.fn()
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when longDistanceRate is missing', async () => {
      const res = mockRes();
      await pricingController.updateSettings(
        { body: { mileageThreshold: 50, shortDistanceRate: 3 }, admin: {} },
        res,
        jest.fn()
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('updates settings when all required fields provided', async () => {
      const updated = { ...mockSettings, shortDistanceRate: 4.0 };
      pricingService.updateSettings.mockResolvedValue(updated);
      const res = mockRes();

      await pricingController.updateSettings(
        {
          body: { mileageThreshold: 50, shortDistanceRate: 4.0, longDistanceRate: 2.8, currency: 'USD' },
          admin: { email: 'admin@test.com' },
        },
        res,
        jest.fn()
      );

      expect(pricingService.updateSettings).toHaveBeenCalledWith(
        { mileageThreshold: 50, shortDistanceRate: 4.0, longDistanceRate: 2.8, currency: 'USD' },
        'admin@test.com'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toBe('Pricing settings updated');
    });

    it('uses fallback "admin" email when req.admin is absent', async () => {
      pricingService.updateSettings.mockResolvedValue(mockSettings);

      await pricingController.updateSettings(
        { body: { mileageThreshold: 50, shortDistanceRate: 3.5, longDistanceRate: 2.8 } },
        mockRes(),
        jest.fn()
      );

      expect(pricingService.updateSettings).toHaveBeenCalledWith(
        expect.any(Object),
        'admin'
      );
    });
  });

  describe('calculatePrice()', () => {
    it('returns 400 when pickupLocation is missing', async () => {
      const res = mockRes();
      await pricingController.calculatePrice(
        { body: { dropoffLocation: '456 Elm St' } },
        res,
        jest.fn()
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].message).toMatch(/pickupLocation/);
    });

    it('returns 400 when dropoffLocation is missing', async () => {
      const res = mockRes();
      await pricingController.calculatePrice(
        { body: { pickupLocation: '123 Main St' } },
        res,
        jest.fn()
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns calculated price when both locations provided', async () => {
      const calculation = {
        distanceMiles: 30,
        pricingType: 'short-distance',
        rateUsed: 3.5,
        estimatedTotal: 105,
        currency: 'USD',
        durationText: '45 mins',
        pickupResolvedAddress: '123 Main St, Denver, CO',
        dropoffResolvedAddress: '456 Elm St, Boulder, CO',
      };
      pricingService.calculateForTrip.mockResolvedValue(calculation);
      const res = mockRes();

      await pricingController.calculatePrice(
        { body: { pickupLocation: '123 Main St', dropoffLocation: '456 Elm St' } },
        res,
        jest.fn()
      );

      expect(pricingService.calculateForTrip).toHaveBeenCalledWith('123 Main St', '456 Elm St');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data).toEqual(calculation);
    });

    it('propagates service errors to next', async () => {
      pricingService.calculateForTrip.mockRejectedValue(new Error('Maps error'));
      const next = jest.fn();

      await pricingController.calculatePrice(
        { body: { pickupLocation: 'a', dropoffLocation: 'b' } },
        mockRes(),
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
