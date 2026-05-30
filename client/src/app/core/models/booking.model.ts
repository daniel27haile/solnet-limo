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
  | 'Cash App'
  | 'Zelle';

export interface Booking {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  dropoffLocation: string;
  serviceType: ServiceType;
  date: string;
  time: string;
  passengers: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  dropoffLocation: string;
  serviceType: ServiceType | '';
  date: string;
  time: string;
  passengers: number | null;
  paymentMethod: PaymentMethod | '';
  notes?: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}
