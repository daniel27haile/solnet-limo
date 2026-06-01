import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ContactService } from './contact.service';
import { ContactMessage, MessageStats } from '../models/contact.model';
import { environment } from '../../../environments/environment';
import {
  createMockContactFormData,
  createMockContactMessage,
  createMockMessageStats,
} from '../../testing/test-fixtures';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  const BASE = `${environment.apiUrl}/contact`;

  const mockMessage = createMockContactMessage();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContactService],
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // -------------------------------------------------------------------------

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // -------------------------------------------------------------------------

  describe('submitMessage()', () => {
    it('POSTs form data and returns the created ContactMessage', fakeAsync(() => {
      const formData = createMockContactFormData();
      let received: ContactMessage | undefined;
      service.submitMessage(formData).subscribe((r) => (received = r));

      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(formData);
      req.flush({ success: true, message: 'Message sent', data: mockMessage });
      tick();

      expect(received).toEqual(mockMessage);
    }));
  });

  // -------------------------------------------------------------------------

  describe('getMessages()', () => {
    it('GETs all messages with no query params when called without arguments', fakeAsync(() => {
      const page = { messages: [mockMessage], total: 1 };
      let received: typeof page | undefined;
      service.getMessages().subscribe((r) => (received = r));

      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toHaveSize(0);
      req.flush({ success: true, message: 'Success', data: page });
      tick();

      expect(received).toEqual(page);
    }));

    it('appends isRead=false, page, and limit when all three are provided', fakeAsync(() => {
      service.getMessages({ isRead: false, page: 1, limit: 20 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE);
      expect(req.request.params.get('isRead')).toBe('false');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('20');
      req.flush({ success: true, message: 'Success', data: {} });
      tick();
    }));

    it('appends isRead=true when explicitly requested', fakeAsync(() => {
      // Covers the `params.isRead !== undefined` branch with a truthy value.
      service.getMessages({ isRead: true }).subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE);
      expect(req.request.params.get('isRead')).toBe('true');
      req.flush({ success: true, message: 'Success', data: {} });
      tick();
    }));

    it('omits all params when an empty options object is passed', fakeAsync(() => {
      service.getMessages({}).subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE);
      expect(req.request.params.has('isRead')).toBeFalse();
      expect(req.request.params.has('page')).toBeFalse();
      expect(req.request.params.has('limit')).toBeFalse();
      req.flush({ success: true, message: 'Success', data: {} });
      tick();
    }));
  });

  // -------------------------------------------------------------------------

  describe('getMessageById()', () => {
    it('GETs a single message by id', fakeAsync(() => {
      let received: ContactMessage | undefined;
      service.getMessageById(mockMessage._id).subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/${mockMessage._id}`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: mockMessage });
      tick();

      expect(received).toEqual(mockMessage);
    }));
  });

  // -------------------------------------------------------------------------

  describe('markAsRead()', () => {
    it('PATCHes /:id/read and returns the message with isRead set to true', fakeAsync(() => {
      const readMessage = createMockContactMessage({ isRead: true });
      let received: ContactMessage | undefined;
      service.markAsRead(mockMessage._id).subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/${mockMessage._id}/read`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ success: true, message: 'Marked as read', data: readMessage });
      tick();

      expect(received!.isRead).toBeTrue();
    }));
  });

  // -------------------------------------------------------------------------

  describe('deleteMessage()', () => {
    it('DELETEs a message by id and completes the observable', fakeAsync(() => {
      let completed = false;
      service.deleteMessage(mockMessage._id).subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${BASE}/${mockMessage._id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, message: 'Deleted', data: null });
      tick();

      expect(completed).toBeTrue();
    }));
  });

  // -------------------------------------------------------------------------

  describe('getStats()', () => {
    it('GETs message statistics', fakeAsync(() => {
      const stats: MessageStats = createMockMessageStats();
      let received: MessageStats | undefined;
      service.getStats().subscribe((r) => (received = r));

      const req = httpMock.expectOne(`${BASE}/stats`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: stats });
      tick();

      expect(received).toEqual(stats);
    }));
  });
});
