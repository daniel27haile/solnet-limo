import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BookingService } from './booking.service';
import { Booking, BookingStats } from '../models/booking.model';
import { environment } from '../../../environments/environment';
import {
  createMockBooking,
  createMockBookingDraft,
  createMockBookingStats,
} from '../../testing/test-fixtures';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  const BASE = `${environment.apiUrl}/bookings`;

  // Stable defaults — tests that need a different value use createMock*() inline.
  const mockBooking = createMockBooking();
  const mockDraft = createMockBookingDraft();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService],
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // -------------------------------------------------------------------------

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // -------------------------------------------------------------------------

  describe('submitBooking()', () => {
    it('POSTs the booking draft and returns the created Booking', fakeAsync(() => {
      let received: Booking | undefined;
      service.submitBooking(mockDraft).subscribe((r) => (received = r));

      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockDraft);
      req.flush({ success: true, message: 'Created', data: mockBooking });
      tick();

      expect(received).toEqual(mockBooking);
    }));
  });

  // -------------------------------------------------------------------------

  describe('getBookings()', () => {
    it('GETs bookings with no query params when called without arguments', fakeAsync(() => {
      const page = { bookings: [mockBooking], total: 1 };
      let received: typeof page | undefined;
      service.getBookings().subscribe((r) => (received = r));

      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toHaveSize(0);
      req.flush({ success: true, message: 'Success', data: page });
      tick();

      expect(received).toEqual(page);
    }));

    it('appends status, page, and limit params when all three are provided', fakeAsync(() => {
      service.getBookings({ status: 'pending', page: 2, limit: 10 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE);
      expect(req.request.params.get('status')).toBe('pending');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush({ success: true, message: 'Success', data: {} });
      tick();
    }));

    it('omits all params when an empty options object is passed', fakeAsync(() => {
      service.getBookings({}).subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE);
      expect(req.request.params.has('status')).toBeFalse();
      expect(req.request.params.has('page')).toBeFalse();
      expect(req.request.params.has('limit')).toBeFalse();
      req.flush({ success: true, message: 'Success', data: {} });
      tick();
    }));
  });

  // -------------------------------------------------------------------------

  describe('getBookingById()', () => {
    it('GETs a single booking by id', fakeAsync(() => {
      let received: Booking | undefined;
      service.getBookingById(mockBooking._id).subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/${mockBooking._id}`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: mockBooking });
      tick();

      expect(received).toEqual(mockBooking);
    }));
  });

  // -------------------------------------------------------------------------

  describe('updateStatus()', () => {
    it('PATCHes /:id/status and returns the updated booking', fakeAsync(() => {
      const confirmed = createMockBooking({ status: 'confirmed' });
      let received: Booking | undefined;
      service.updateStatus(mockBooking._id, 'confirmed').subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/${mockBooking._id}/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'confirmed' });
      req.flush({ success: true, message: 'Updated', data: confirmed });
      tick();

      expect(received!.status).toBe('confirmed');
    }));
  });

  // -------------------------------------------------------------------------

  describe('deleteBooking()', () => {
    it('DELETEs a booking by id and completes the observable', fakeAsync(() => {
      let completed = false;
      service.deleteBooking(mockBooking._id).subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${BASE}/${mockBooking._id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, message: 'Deleted', data: null });
      tick();

      expect(completed).toBeTrue();
    }));
  });

  // -------------------------------------------------------------------------

  describe('getStats()', () => {
    it('GETs booking statistics', fakeAsync(() => {
      const stats: BookingStats = createMockBookingStats();
      let received: BookingStats | undefined;
      service.getStats().subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/stats`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: stats });
      tick();

      expect(received).toEqual(stats);
    }));
  });
});
