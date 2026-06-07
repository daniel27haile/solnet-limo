export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ServiceType =
  | 'Wedding'
  | 'Prom'
  | 'Homecoming'
  | 'Graduation'
  | 'Birthday'
  | 'Anniversary'
  | 'Conference'
  | 'Airport Transportation'
  | 'Hotel Transportation'
  | 'Restaurant Transportation'
  | 'Club Transportation'
  | 'Theater Transportation'
  | 'Cinema Transportation'
  | 'Cruise Transportation'
  | 'Downtown Transportation'
  | 'Medical Center Transportation'
  | 'Anywhere to Anywhere';

export type PaymentMethod =
  | 'Visa'
  | 'Mastercard'
  | 'American Express'
  | 'Discover'
  | 'Cash App Pay'
  | 'Zelle';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface Booking {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLocation: string;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  serviceType: ServiceType;
  vehicleType: string;
  date: string;
  time: string;
  passengers: number;
  notes?: string;
  distanceMiles?: number;
  pricingRate?: number;
  pricingType?: 'short-distance' | 'long-distance';
  estimatedTotal?: number;
  finalTotal?: number;
  paymentStatus: PaymentStatus;
  squarePaymentId?: string;
  paymentMethod?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDraft {
  fullName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLocation: string;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  serviceType: ServiceType | '';
  vehicleType: string;
  date: string;
  time: string;
  passengers: number | null;
  notes: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}
