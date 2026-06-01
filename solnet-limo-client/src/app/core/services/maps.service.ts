import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class MapsService {
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  /** Dynamically loads the Google Maps JS API with Places library. */
  loadMapsApi(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      if (!environment.googleMapsBrowserKey) {
        reject(new Error('Google Maps API key is not configured.'));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsBrowserKey}&libraries=places&callback=__googleMapsCallback`;
      script.async = true;
      script.defer = true;

      (window as any)['__googleMapsCallback'] = () => {
        this.loaded = true;
        resolve();
      };

      script.onerror = () => reject(new Error('Failed to load Google Maps API.'));
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Attaches a Google Places Autocomplete to a native input element.
   * Calls onPlaceSelected with the resolved address string when a place is picked.
   */
  attachAutocomplete(
    inputEl: HTMLInputElement,
    onPlaceSelected: (address: string, lat?: number, lng?: number) => void
  ): void {
    const autocomplete = new google.maps.places.Autocomplete(inputEl, {
      types: ['geocode', 'establishment'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const address = place.formatted_address || place.name || inputEl.value;
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      onPlaceSelected(address, lat, lng);
    });
  }

  /** Gets the browser's current geolocation. */
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => {
          const messages: Record<number, string> = {
            1: 'Location access denied. Please allow location permission or enter address manually.',
            2: 'Location unavailable. Please enter your address manually.',
            3: 'Location request timed out. Please enter your address manually.',
          };
          reject(new Error(messages[err.code] || 'Could not get your location.'));
        },
        { timeout: 10000 }
      );
    });
  }

  /** Reverse geocodes lat/lng to an address string using Google Geocoding. */
  reverseGeocode(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error('Could not convert location to address.'));
        }
      });
    });
  }
}
