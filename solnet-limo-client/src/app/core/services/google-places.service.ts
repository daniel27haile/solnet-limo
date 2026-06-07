import { Injectable, isDevMode } from '@angular/core';
import { MapsService } from './maps.service';

declare const google: any;

export interface PlacePrediction {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetail {
  formattedAddress: string;
  lat: number | null;
  lng: number | null;
  placeId: string;
}

/**
 * Thrown when the Google Maps API key is missing, the script failed to
 * load, or the key is not authorised for the Places API.
 * Distinct from a transient / network error so the component can show the
 * right message to the user.
 */
export class PlacesNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlacesNotConfiguredError';
  }
}

@Injectable({ providedIn: 'root' })
export class GooglePlacesService {
  private autocompleteService: any = null;
  private placesService: any = null;

  constructor(private mapsService: MapsService) {}

  private async ensureReady(): Promise<void> {
    try {
      await this.mapsService.loadMapsApi();
    } catch (err: any) {
      if (isDevMode()) {
        console.error('[GooglePlacesService] loadMapsApi() failed:', err?.message ?? err);
      }
      throw new PlacesNotConfiguredError(err?.message ?? 'Google Maps API failed to load');
    }

    if (isDevMode()) {
      const gPlaces = (window as any)['google']?.maps?.places;
      console.log('[GooglePlacesService] google.maps.places present:', !!gPlaces);
      if (!gPlaces) {
        console.error('[GooglePlacesService] Places library missing — ensure "libraries=places" is in the script URL.');
      }
    }

    if (!this.autocompleteService) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    if (!this.placesService) {
      // PlacesService requires a DOM node or Map instance
      const div = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(div);
    }
  }

  async ensureSessionToken(existing: any): Promise<any> {
    await this.mapsService.loadMapsApi().catch((err: any) => {
      throw new PlacesNotConfiguredError(err?.message ?? 'Google Maps API failed to load');
    });
    if (!existing) {
      const token = new google.maps.places.AutocompleteSessionToken();
      if (isDevMode()) console.log('[GooglePlacesService] New session token created');
      return token;
    }
    return existing;
  }

  /**
   * Fetch address predictions for the given partial input.
   *
   * Returns an empty array for ZERO_RESULTS (input is valid but no matches).
   * Throws PlacesNotConfiguredError for REQUEST_DENIED (bad key / API not enabled).
   * Throws a plain Error for other non-OK statuses.
   */
  async getPredictions(input: string, sessionToken?: any): Promise<PlacePrediction[]> {
    await this.ensureReady();

    // No `types` filter — widest coverage including numeric street numbers,
    // ZIP codes, cities, airports, businesses, landmarks, etc.
    const request: any = {
      input,
      componentRestrictions: { country: 'us' },
    };
    if (sessionToken) request.sessionToken = sessionToken;

    if (isDevMode()) {
      console.log('[GooglePlacesService] getPlacePredictions →', { input, componentRestrictions: request.componentRestrictions });
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService.getPlacePredictions(
        request,
        (predictions: any[] | null, status: string) => {
          if (isDevMode()) {
            console.log(
              `[GooglePlacesService] status=${status} | count=${predictions?.length ?? 0}`,
              status === 'OK' ? predictions?.map((p: any) => p.description) : ''
            );
            if (status === 'REQUEST_DENIED') {
              console.error(
                '[GooglePlacesService] REQUEST_DENIED — check:\n' +
                '  1. API key is correct in environment.ts\n' +
                '  2. "Maps JavaScript API" is enabled in Google Cloud Console\n' +
                '  3. "Places API" is enabled in Google Cloud Console\n' +
                '  4. Billing is enabled on the Google Cloud project\n' +
                '  5. HTTP referrer restriction allows http://localhost:4200/*'
              );
            }
          }

          if (status === 'OK' && predictions) {
            resolve(
              predictions.map((p: any) => ({
                description:   p.description,
                placeId:       p.place_id,
                mainText:      p.structured_formatting?.main_text      ?? p.description,
                secondaryText: p.structured_formatting?.secondary_text ?? '',
              }))
            );
            return;
          }

          if (status === 'ZERO_RESULTS') {
            resolve([]);
            return;
          }

          // REQUEST_DENIED → key/billing/API issue → not a transient error
          if (status === 'REQUEST_DENIED') {
            reject(new PlacesNotConfiguredError(`Places API request denied — check API key, billing, and enabled APIs`));
            return;
          }

          // Any other error (INVALID_REQUEST, UNKNOWN_ERROR, OVER_QUERY_LIMIT, etc.)
          reject(new Error(`Places API error: ${status}`));
        }
      );
    });
  }

  async getPlaceDetail(placeId: string, sessionToken?: any): Promise<PlaceDetail> {
    await this.ensureReady();

    const request: any = {
      placeId,
      fields: ['formatted_address', 'geometry', 'place_id'],
    };
    if (sessionToken) request.sessionToken = sessionToken;

    return new Promise((resolve, reject) => {
      this.placesService.getDetails(request, (place: any, status: string) => {
        if (isDevMode()) {
          console.log('[GooglePlacesService] getDetails status:', status);
        }
        if (status !== 'OK' || !place) {
          reject(new Error(`Place details error: ${status}`));
          return;
        }
        resolve({
          formattedAddress: place.formatted_address ?? '',
          lat:     place.geometry?.location?.lat() ?? null,
          lng:     place.geometry?.location?.lng() ?? null,
          placeId: place.place_id ?? placeId,
        });
      });
    });
  }
}
