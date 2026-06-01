import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PaymentService } from './payment.service';
import { PaymentConfirmation } from '../models/payment.model';
import { environment } from '../../../environments/environment';
import {
  createMockBookingDraft,
  createMockPaymentConfirmation,
} from '../../testing/test-fixtures';

// ---------------------------------------------------------------------------
// Local interfaces for Square SDK mock objects.
//
// The Square Web Payments SDK is a third-party global with no @types package
// in this project.  The service declares `Square` and `squareCard` as `any`.
// We define minimal typed interfaces here so the mock objects in the tests
// are structured and type-checked, rather than relying on implicit `any`.
// ---------------------------------------------------------------------------

/** Shape of the result returned by `squareCard.tokenize()`. */
interface TokenizeResult {
  status: string;
  token?: string;
  errors?: Array<{ message: string }>;
}

/**
 * Minimal interface for the Square card form object held in the service's
 * private `squareCard` field.  Only the methods exercised by the tests are
 * listed here.
 */
interface MockSquareCard {
  tokenize: jasmine.Spy<() => Promise<TokenizeResult>>;
  destroy?: jasmine.Spy<() => Promise<void>>;
}

// ---------------------------------------------------------------------------

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  const BASE = `${environment.apiUrl}/payments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService],
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    // Remove any Square SDK <script> tags injected during tests.
    // Without this cleanup the singleton guard (`if (this.sdkLoadPromise)`)
    // would find the tag from a previous test and resolve immediately,
    // masking the real loading path in subsequent tests.
    document.querySelectorAll(`script[src="${environment.squareSdkUrl}"]`).forEach((s) => s.remove());
  });

  // -------------------------------------------------------------------------

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // -------------------------------------------------------------------------

  describe('loadSquareSdk()', () => {
    it('returns a Promise', () => {
      const result = service.loadSquareSdk();
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => null); // suppress unhandled rejection — SDK URL unreachable in CI
    });

    it('returns the identical Promise on subsequent calls (singleton guard)', () => {
      // Compare raw Promise references BEFORE calling .catch(), because .catch()
      // creates a new derived Promise that would break reference equality.
      const p1 = service.loadSquareSdk();
      const p2 = service.loadSquareSdk();
      expect(p1).toBe(p2);
      p1.catch(() => {}); // suppress unhandled rejection
    });

    it('resolves immediately when the SDK has already been loaded (sdkLoaded = true)', async () => {
      // `sdkLoaded` is a private field.  The `as any` cast is the only way to
      // set this flag without invoking the real SDK network load.
      (service as any).sdkLoaded = true;
      await expectAsync(service.loadSquareSdk()).toBeResolved();
    });

    it('resolves immediately when a matching <script> already exists in the DOM', async () => {
      const existing = document.createElement('script');
      existing.src = environment.squareSdkUrl;
      document.head.appendChild(existing);

      // Reset the singleton state so the method re-inspects the DOM rather
      // than returning the cached promise from a prior call.
      // Both `sdkLoaded` and `sdkLoadPromise` are private fields; `as any` is required.
      (service as any).sdkLoaded = false;
      (service as any).sdkLoadPromise = null;

      await expectAsync(service.loadSquareSdk()).toBeResolved();
      existing.remove();
    });
  });

  // -------------------------------------------------------------------------

  describe('tokenize()', () => {
    it('rejects when the card form has not been initialized', async () => {
      await expectAsync(service.tokenize()).toBeRejectedWithError('Payment form not initialized.');
    });

    it('resolves with the token when the SDK returns status OK', async () => {
      const mockCard: MockSquareCard = {
        tokenize: jasmine.createSpy('tokenize').and.resolveTo({
          status: 'OK',
          token: 'tok_test_abc123',
        }),
      };
      // `squareCard` is private; `as any` is the only way to inject the mock
      // without executing the real Square SDK initialization via initCard().
      (service as any).squareCard = mockCard;

      await expectAsync(service.tokenize()).toBeResolvedTo('tok_test_abc123');
    });

    it('rejects with joined error messages when the SDK returns an errors array', async () => {
      const mockCard: MockSquareCard = {
        tokenize: jasmine.createSpy('tokenize').and.resolveTo({
          status: 'ERROR',
          errors: [{ message: 'Card number invalid' }, { message: 'CVV required' }],
        }),
      };
      (service as any).squareCard = mockCard;

      await expectAsync(service.tokenize()).toBeRejectedWithError(
        'Card number invalid, CVV required'
      );
    });

    it('rejects with the fallback message when the SDK provides no errors array', async () => {
      const mockCard: MockSquareCard = {
        tokenize: jasmine.createSpy('tokenize').and.resolveTo({ status: 'ERROR' }),
      };
      (service as any).squareCard = mockCard;

      await expectAsync(service.tokenize()).toBeRejectedWithError('Card tokenization failed.');
    });
  });

  // -------------------------------------------------------------------------

  describe('destroyCard()', () => {
    it('resolves without error when no card form is attached', async () => {
      await expectAsync(service.destroyCard()).toBeResolved();
    });

    it('calls destroy() on the card form and nulls the internal reference', async () => {
      const mockCard: MockSquareCard = {
        tokenize: jasmine.createSpy('tokenize'),
        destroy: jasmine.createSpy('destroy').and.resolveTo(undefined),
      };
      (service as any).squareCard = mockCard; // `squareCard` is private; see tokenize() note

      await service.destroyCard();

      // destroy is defined in this mock; `!` removes the optional union so
      // TypeScript finds the correct Matchers overload.
      expect(mockCard.destroy!).toHaveBeenCalled();
      expect((service as any).squareCard).toBeNull();
    });
  });

  // -------------------------------------------------------------------------

  describe('createPayment()', () => {
    it('POSTs bookingDraft + sourceId to /payments/create and returns PaymentConfirmation',
      fakeAsync(() => {
        const draft = createMockBookingDraft();
        const confirmation = createMockPaymentConfirmation({ squarePaymentId: 'sq-pay-xyz' });
        let received: PaymentConfirmation | undefined;
        service.createPayment(draft, 'cnon:source-id').subscribe((r) => (received = r));

        const req = httpMock.expectOne(`${BASE}/create`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ bookingDraft: draft, sourceId: 'cnon:source-id' });
        req.flush({ success: true, message: 'Payment processed', data: confirmation });
        tick();

        expect(received).toEqual(confirmation);
      })
    );
  });

  // -------------------------------------------------------------------------

  describe('initCard()', () => {
    it('rejects when Square App ID is not configured', async () => {
      // environment.squareAppId contains 'REPLACE' in the dev environment,
      // which triggers the configuration guard inside initCard().
      await expectAsync(service.initCard('payment-form')).toBeRejectedWithError(
        /Square App ID is not configured/
      );
    });
  });
});
