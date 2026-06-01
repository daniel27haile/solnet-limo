/**
 * Shared test factory helpers used across service specs.
 *
 * Each factory returns a fully-typed, structurally valid mock that satisfies
 * the real model interface.  Pass `overrides` to customise only the fields
 * that matter for a particular test, keeping every other field at a known,
 * stable default.
 *
 * Pattern:
 *   const booking = createMockBooking({ status: 'confirmed' });
 *   const draft   = createMockBookingDraft({ serviceType: 'Wedding' });
 */

import { AdminUser, AuthResponse } from '../core/models/api.model';
import { Booking, BookingDraft, BookingStats } from '../core/models/booking.model';
import { ContactFormData, ContactMessage, MessageStats } from '../core/models/contact.model';
import { PaymentConfirmation } from '../core/models/payment.model';
import { PriceCalculation, PricingSettings } from '../core/models/pricing.model';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const createMockAdminUser = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: 'admin-1',
  name: 'Test Admin',
  email: 'admin@solnetlimo.com',
  role: 'admin',
  ...overrides,
});

export const createMockAuthResponse = (overrides: Partial<AuthResponse> = {}): AuthResponse => ({
  token: 'mock.jwt.token',
  admin: createMockAdminUser(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

export const createMockBooking = (overrides: Partial<Booking> = {}): Booking => ({
  _id: 'booking-1',
  fullName: 'Daniel Haile',
  phone: '206-555-0101',
  email: 'daniel@test.com',
  pickupLocation: 'Seattle, WA',
  dropoffLocation: 'SeaTac Airport',
  serviceType: 'Airport Transportation',
  vehicleType: 'SUV',
  date: '2026-06-01',
  time: '10:30',
  passengers: 2,
  status: 'pending',
  paymentStatus: 'unpaid',
  estimatedTotal: 120,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
  ...overrides,
});

export const createMockBookingDraft = (overrides: Partial<BookingDraft> = {}): BookingDraft => ({
  fullName: 'Daniel Haile',
  phone: '206-555-0101',
  email: 'daniel@test.com',
  pickupLocation: 'Seattle, WA',
  dropoffLocation: 'SeaTac Airport',
  serviceType: 'Airport Transportation',
  vehicleType: 'SUV',
  date: '2026-06-01',
  time: '10:30',
  passengers: 2,
  notes: '',
  ...overrides,
});

export const createMockBookingStats = (overrides: Partial<BookingStats> = {}): BookingStats => ({
  total: 10,
  pending: 3,
  confirmed: 5,
  completed: 1,
  cancelled: 1,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const createMockContactMessage = (overrides: Partial<ContactMessage> = {}): ContactMessage => ({
  _id: 'msg-1',
  name: 'Jane Doe',
  email: 'jane@test.com',
  subject: 'Inquiry',
  message: 'Hello, I need a quote.',
  isRead: false,
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
  ...overrides,
});

export const createMockContactFormData = (overrides: Partial<ContactFormData> = {}): ContactFormData => ({
  name: 'Jane Doe',
  email: 'jane@test.com',
  subject: 'Inquiry',
  message: 'Hello, I need a quote.',
  ...overrides,
});

export const createMockMessageStats = (overrides: Partial<MessageStats> = {}): MessageStats => ({
  total: 5,
  unread: 2,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export const createMockPaymentConfirmation = (
  overrides: Partial<PaymentConfirmation> = {}
): PaymentConfirmation => ({
  bookingId: 'booking-1',
  paymentStatus: 'paid',
  finalTotal: 120,
  currency: 'USD',
  distanceMiles: 30,
  pricingType: 'short-distance',
  rateUsed: 3.5,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export const createMockPricingSettings = (overrides: Partial<PricingSettings> = {}): PricingSettings => ({
  mileageThreshold: 50,
  shortDistanceRate: 3.5,
  longDistanceRate: 2.8,
  currency: 'USD',
  isActive: true,
  ...overrides,
});

export const createMockPriceCalculation = (overrides: Partial<PriceCalculation> = {}): PriceCalculation => ({
  distanceMiles: 30,
  mileageThreshold: 50,
  rateUsed: 3.5,
  pricingType: 'short-distance',
  estimatedTotal: 105,
  currency: 'USD',
  ...overrides,
});
