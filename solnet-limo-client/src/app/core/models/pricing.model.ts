export interface PricingSettings {
  _id?: string;
  mileageThreshold: number;
  shortDistanceRate: number;
  longDistanceRate: number;
  currency: string;
  isActive: boolean;
  minimumFareEnabled: boolean;
  minimumFareDistance: number;
  minimumFareAmount: number;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PriceCalculation {
  distanceMiles: number;
  mileageThreshold: number;
  rateUsed: number;
  pricingType: 'short-distance' | 'long-distance';
  estimatedTotal: number;
  currency: string;
  durationText?: string;
  pickupResolvedAddress?: string;
  dropoffResolvedAddress?: string;
  minimumFareApplied?: boolean;
  minimumFareAmount?: number;
  minimumFareDistance?: number;
}
