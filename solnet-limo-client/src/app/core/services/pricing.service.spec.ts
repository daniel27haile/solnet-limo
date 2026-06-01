import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PricingService } from './pricing.service';
import { PriceCalculation, PricingSettings } from '../models/pricing.model';
import { environment } from '../../../environments/environment';
import {
  createMockPriceCalculation,
  createMockPricingSettings,
} from '../../testing/test-fixtures';

describe('PricingService', () => {
  let service: PricingService;
  let httpMock: HttpTestingController;

  const BASE = `${environment.apiUrl}/pricing`;

  const mockSettings = createMockPricingSettings();
  const mockCalculation = createMockPriceCalculation({
    durationText: '45 mins',
    pickupResolvedAddress: 'Seattle, WA',
    dropoffResolvedAddress: 'SeaTac Airport',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PricingService],
    });
    service = TestBed.inject(PricingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // -------------------------------------------------------------------------

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // -------------------------------------------------------------------------

  describe('getSettings()', () => {
    it('GETs /pricing/settings and returns PricingSettings', fakeAsync(() => {
      let received: PricingSettings | undefined;
      service.getSettings().subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/settings`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: mockSettings });
      tick();

      expect(received).toEqual(mockSettings);
    }));
  });

  // -------------------------------------------------------------------------

  describe('calculatePrice()', () => {
    it('POSTs pickup and dropoff locations and returns PriceCalculation', fakeAsync(() => {
      let received: PriceCalculation | undefined;
      service.calculatePrice('Seattle, WA', 'SeaTac Airport').subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/calculate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        pickupLocation: 'Seattle, WA',
        dropoffLocation: 'SeaTac Airport',
      });
      req.flush({ success: true, message: 'Success', data: mockCalculation });
      tick();

      expect(received).toEqual(mockCalculation);
    }));
  });

  // -------------------------------------------------------------------------

  describe('updateSettings()', () => {
    it('PATCHes /pricing/settings and returns the updated PricingSettings', fakeAsync(() => {
      const update: Partial<PricingSettings> = { shortDistanceRate: 4.25 };
      const updated = createMockPricingSettings({ shortDistanceRate: 4.25 });
      let received: PricingSettings | undefined;
      service.updateSettings(update).subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/settings`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(update);
      req.flush({ success: true, message: 'Updated', data: updated });
      tick();

      expect(received!.shortDistanceRate).toBe(4.25);
    }));
  });
});
