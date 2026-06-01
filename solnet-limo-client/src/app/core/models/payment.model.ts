export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentConfirmation {
  bookingId: string;
  paymentStatus: PaymentStatus;
  finalTotal: number;
  currency: string;
  distanceMiles: number;
  pricingType: 'short-distance' | 'long-distance';
  rateUsed: number;
  squarePaymentId?: string;
}
