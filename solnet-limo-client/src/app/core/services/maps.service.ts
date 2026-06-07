import { Injectable, isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class MapsService {
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Loads the Google Maps JS API (with Places library) exactly once per page lifecycle.
   *
   * Three cases handled:
   *   1. `window.google.maps.places` already exists  →  resolve immediately (handles Angular HMR
   *      where the <script> tag and window.google survive the service-singleton reset).
   *   2. <script> tag is in <head> but google isn't ready yet  →  re-attach callback and wait
   *      (edge case: HMR fired while the script was mid-download).
   *   3. No script at all  →  inject it fresh.
   */
  loadMapsApi(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      if (!environment.googleMapsBrowserKey) {
        if (isDevMode()) {
          console.error(
            '[MapsService] googleMapsBrowserKey is empty.\n' +
            '  → Set it in src/environments/environment.ts\n' +
            '  → Enable "Maps JavaScript API" + "Places API" in Google Cloud Console\n' +
            '  → Add http://localhost:4200/* to the key\'s HTTP referrer restrictions'
          );
        }
        reject(new Error('Google Maps API key is not configured'));
        return;
      }

      // Case 1: API already available (normal re-entry, or post-HMR where window.google
      // persists even though the Angular service singleton was reset).
      if ((window as any)['google']?.maps?.places) {
        this.loaded = true;
        if (isDevMode()) {
          console.log('[MapsService] google.maps.places already available — reusing');
        }
        resolve();
        return;
      }

      // Case 2: Script tag is in <head> but google hasn't resolved yet (script still downloading
      // after an HMR reset). Re-attach the global callback and wait.
      if (document.getElementById('__googleMapsScript')) {
        if (isDevMode()) {
          console.log('[MapsService] Script tag found — re-attaching callback and waiting');
        }
        (window as any)['__googleMapsCallback'] = () => {
          this.loaded = true;
          if (isDevMode()) {
            console.log('[MapsService] Google Maps API loaded (re-attached callback)');
          }
          resolve();
        };
        return;
      }

      // Case 3: Fresh injection.
      const script = document.createElement('script');
      script.id    = '__googleMapsScript';
      script.src   = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsBrowserKey}&libraries=places&callback=__googleMapsCallback`;
      script.async = true;
      script.defer = true;

      (window as any)['__googleMapsCallback'] = () => {
        this.loaded = true;
        if (isDevMode()) {
          console.log('[MapsService] Google Maps API loaded');
          console.log('[MapsService] google.maps.places available:', !!(window as any)['google']?.maps?.places);
        }
        resolve();
      };

      script.onerror = () => {
        if (isDevMode()) {
          console.error('[MapsService] Script load failed — check the API key and network');
        }
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
