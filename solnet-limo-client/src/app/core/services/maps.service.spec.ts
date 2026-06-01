import { TestBed } from '@angular/core/testing';
import { MapsService } from './maps.service';

// ---------------------------------------------------------------------------
// Local types for Google Maps mock objects.
//
// `@types/google.maps` is not installed in this project, so the service
// declares `google` as `any`.  We define minimal, strongly-typed interfaces
// here so the mock objects in these tests are structure-checked by TypeScript,
// avoiding implicit `any` inside the test bodies.
//
// Assigning the mock to `(window as any)['google']` is unavoidable — the
// service reads the global `google` identifier, which can only be injected
// into the Karma browser environment via the `window` object.
// ---------------------------------------------------------------------------

interface MockGeocoderResult {
  formatted_address: string;
}

type GeocodeCallback = (results: MockGeocoderResult[], status: string) => void;
type GeocodeFn = (request: object, callback: GeocodeCallback) => void;

interface MockPlace {
  formatted_address?: string;
  name?: string;
  geometry?: {
    location?: {
      lat(): number;
      lng(): number;
    };
  };
}

type GetPlaceFn = () => MockPlace;
type AddListenerFn = (event: string, callback: () => void) => void;

// ---------------------------------------------------------------------------

describe('MapsService', () => {
  let service: MapsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MapsService] });
    service = TestBed.inject(MapsService);
  });

  // -------------------------------------------------------------------------

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // -------------------------------------------------------------------------

  describe('loadMapsApi()', () => {
    it('rejects when googleMapsBrowserKey is not configured', async () => {
      // environment.googleMapsBrowserKey defaults to '' in the dev environment.
      await expectAsync(service.loadMapsApi()).toBeRejectedWithError(
        'Google Maps API key is not configured.'
      );
    });

    it('returns the identical Promise on subsequent calls (singleton guard)', () => {
      // Compare raw Promise references BEFORE calling .catch(), because .catch()
      // creates a new derived Promise that would break reference equality.
      const p1 = service.loadMapsApi();
      const p2 = service.loadMapsApi();
      expect(p1).toBe(p2);
      p1.catch(() => {}); // suppress unhandled rejection from missing API key
    });

    it('resolves immediately when the API has already been loaded', async () => {
      // `loaded` is a private field.  The `as any` cast is the only way to set
      // this flag without performing a real network request.
      (service as any).loaded = true;
      await expectAsync(service.loadMapsApi()).toBeResolved();
    });
  });

  // -------------------------------------------------------------------------

  describe('getCurrentLocation()', () => {
    it('resolves with latitude and longitude on success', async () => {
      const mockPosition = {
        coords: { latitude: 47.6062, longitude: -122.3321 },
      } as GeolocationPosition;

      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (success: PositionCallback) => success(mockPosition)
      );

      const result = await service.getCurrentLocation();
      expect(result.latitude).toBe(47.6062);
      expect(result.longitude).toBe(-122.3321);
    });

    it('rejects with the "access denied" message for error code 1', async () => {
      const err = { code: 1 } as GeolocationPositionError;
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (_success: PositionCallback, error: PositionErrorCallback) => error(err)
      );

      await expectAsync(service.getCurrentLocation()).toBeRejectedWithError(
        'Location access denied. Please allow location permission or enter address manually.'
      );
    });

    it('rejects with "location unavailable" for error code 2', async () => {
      const err = { code: 2 } as GeolocationPositionError;
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (_success: PositionCallback, error: PositionErrorCallback) => error(err)
      );

      await expectAsync(service.getCurrentLocation()).toBeRejectedWithError(
        'Location unavailable. Please enter your address manually.'
      );
    });

    it('rejects with "timed out" for error code 3', async () => {
      const err = { code: 3 } as GeolocationPositionError;
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (_success: PositionCallback, error: PositionErrorCallback) => error(err)
      );

      await expectAsync(service.getCurrentLocation()).toBeRejectedWithError(
        'Location request timed out. Please enter your address manually.'
      );
    });

    it('rejects with the fallback message for unknown error codes', async () => {
      const err = { code: 99 } as GeolocationPositionError;
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (_success: PositionCallback, error: PositionErrorCallback) => error(err)
      );

      await expectAsync(service.getCurrentLocation()).toBeRejectedWithError(
        'Could not get your location.'
      );
    });

    it('rejects when the browser does not support geolocation', async () => {
      const original = navigator.geolocation;
      Object.defineProperty(navigator, 'geolocation', { value: null, configurable: true });

      await expectAsync(service.getCurrentLocation()).toBeRejectedWithError(
        'Geolocation is not supported by your browser.'
      );

      Object.defineProperty(navigator, 'geolocation', { value: original, configurable: true });
    });
  });

  // -------------------------------------------------------------------------

  describe('attachAutocomplete()', () => {
    /** Captured by the mock's addListener so tests can trigger the event. */
    let placeChangedCallback!: () => void;
    let mockGetPlace: jasmine.Spy<GetPlaceFn>;

    beforeEach(() => {
      mockGetPlace = jasmine.createSpy<GetPlaceFn>('getPlace');

      const mockAutocompleteInstance = {
        addListener: jasmine.createSpy<AddListenerFn>('addListener').and.callFake(
          (_event: string, cb: () => void) => { placeChangedCallback = cb; }
        ),
        getPlace: mockGetPlace,
      };

      // See the file-level note — `(window as any)` is required to inject
      // the mock into the Karma browser environment.
      (window as any)['google'] = {
        maps: {
          places: {
            Autocomplete: jasmine
              .createSpy('Autocomplete')
              .and.returnValue(mockAutocompleteInstance),
          },
        },
      };
    });

    afterEach(() => {
      delete (window as any)['google'];
    });

    it('calls onPlaceSelected with formatted_address and coordinates', () => {
      const inputEl = document.createElement('input');
      mockGetPlace.and.returnValue({
        formatted_address: '123 Main St, Seattle, WA',
        geometry: { location: { lat: () => 47.6, lng: () => -122.3 } },
      });

      let capturedAddr: string | undefined;
      let capturedLat: number | undefined;
      let capturedLng: number | undefined;
      service.attachAutocomplete(inputEl, (addr, lat, lng) => {
        capturedAddr = addr;
        capturedLat = lat;
        capturedLng = lng;
      });

      placeChangedCallback();

      expect(capturedAddr).toBe('123 Main St, Seattle, WA');
      expect(capturedLat).toBe(47.6);
      expect(capturedLng).toBe(-122.3);
    });

    it('falls back to place.name when formatted_address is absent', () => {
      const inputEl = document.createElement('input');
      mockGetPlace.and.returnValue({ name: 'Space Needle' });

      let capturedAddr: string | undefined;
      service.attachAutocomplete(inputEl, (addr) => { capturedAddr = addr; });
      placeChangedCallback();

      expect(capturedAddr).toBe('Space Needle');
    });

    it('falls back to inputEl.value when neither formatted_address nor name is present', () => {
      const inputEl = document.createElement('input');
      inputEl.value = 'manually typed address';
      mockGetPlace.and.returnValue({});

      let capturedAddr: string | undefined;
      service.attachAutocomplete(inputEl, (addr) => { capturedAddr = addr; });
      placeChangedCallback();

      expect(capturedAddr).toBe('manually typed address');
    });
  });

  // -------------------------------------------------------------------------

  describe('reverseGeocode()', () => {
    let mockGeocodeFn: jasmine.Spy<GeocodeFn>;

    beforeEach(() => {
      mockGeocodeFn = jasmine.createSpy<GeocodeFn>('geocode');

      // See the file-level note — `(window as any)` is required here.
      (window as any)['google'] = {
        maps: {
          Geocoder: jasmine
            .createSpy('Geocoder')
            .and.returnValue({ geocode: mockGeocodeFn }),
        },
      };
    });

    afterEach(() => {
      delete (window as any)['google'];
    });

    it('resolves with the formatted address when geocoding succeeds', async () => {
      mockGeocodeFn.and.callFake((_req, cb) => {
        cb([{ formatted_address: '456 Oak Ave, Denver, CO' }], 'OK');
      });

      const result = await service.reverseGeocode(39.7, -104.9);
      expect(result).toBe('456 Oak Ave, Denver, CO');
    });

    it('rejects when the status is not OK', async () => {
      mockGeocodeFn.and.callFake((_req, cb) => {
        cb([], 'ZERO_RESULTS');
      });

      await expectAsync(service.reverseGeocode(39.7, -104.9)).toBeRejectedWithError(
        'Could not convert location to address.'
      );
    });

    it('rejects when the status is OK but the results array is empty', async () => {
      // Covers the `results[0]` falsy branch: status === 'OK' but no results.
      mockGeocodeFn.and.callFake((_req, cb) => {
        cb([], 'OK');
      });

      await expectAsync(service.reverseGeocode(39.7, -104.9)).toBeRejectedWithError(
        'Could not convert location to address.'
      );
    });
  });
});
