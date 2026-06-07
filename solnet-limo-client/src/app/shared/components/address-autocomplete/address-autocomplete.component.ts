import {
  Component, Input, Output, EventEmitter,
  HostListener, ElementRef, inject, signal, OnDestroy, isDevMode,
} from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import {
  GooglePlacesService, PlacePrediction, PlacesNotConfiguredError,
} from '../../../core/services/google-places.service';

export interface AddressSelectedEvent {
  address: string;
  lat: number | null;
  lng: number | null;
  placeId: string;
}

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './address-autocomplete.component.html',
  styleUrls: ['./address-autocomplete.component.scss'],
})
export class AddressAutocompleteComponent implements OnDestroy {
  @Input({ required: true }) control!: AbstractControl;
  @Input() label = '';
  @Input() placeholder = 'Enter address';
  @Input() inputId = '';
  @Input() errorMessage = '';

  @Output() placeSelected = new EventEmitter<AddressSelectedEvent>();

  private placesService = inject(GooglePlacesService);
  private elRef        = inject(ElementRef);

  predictions  = signal<PlacePrediction[]>([]);
  isOpen       = signal(false);
  isLoading    = signal(false);
  noResults    = signal(false);
  apiError     = signal('');
  activeIndex  = signal(-1);

  private sessionToken: any = null;
  private debounceTimer: any = null;

  get isInvalid(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  async onInput(event: Event): Promise<void> {
    const value = (event.target as HTMLInputElement).value;

    if (isDevMode()) {
      console.log(`[AddressAutocomplete:${this.inputId}] onInput →`, JSON.stringify(value));
    }

    this.apiError.set('');
    this.noResults.set(false);
    this.activeIndex.set(-1);

    if (value.length < 2) {
      this.close();
      return;
    }

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.fetchPredictions(value), 300);
  }

  onFocus(): void {
    const value = (this.control.value ?? '').trim();
    if (value.length >= 2 && (this.predictions().length > 0 || this.noResults())) {
      this.isOpen.set(true);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    const list = this.predictions();
    const idx  = this.activeIndex();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.set(Math.min(idx + 1, list.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(Math.max(idx - 1, 0));
    } else if (event.key === 'Enter' && idx >= 0) {
      event.preventDefault();
      this.selectPrediction(list[idx]);
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  // mousedown + preventDefault prevents blur from firing before click
  onPredictionMousedown(event: MouseEvent, prediction: PlacePrediction): void {
    event.preventDefault();
    this.selectPrediction(prediction);
  }

  private async fetchPredictions(input: string): Promise<void> {
    this.isLoading.set(true);
    this.noResults.set(false);

    if (isDevMode()) {
      console.log(`[AddressAutocomplete:${this.inputId}] fetchPredictions →`, JSON.stringify(input));
      console.log(`[AddressAutocomplete:${this.inputId}] google object present:`, !!(window as any)['google']);
      console.log(`[AddressAutocomplete:${this.inputId}] google.maps.places present:`, !!(window as any)['google']?.maps?.places);
    }

    try {
      if (!this.sessionToken) {
        this.sessionToken = await this.placesService.ensureSessionToken(null);
      }

      const results = await this.placesService.getPredictions(input, this.sessionToken);

      if (isDevMode()) {
        console.log(`[AddressAutocomplete:${this.inputId}] predictions received:`, results.length, results.map((p) => p.description));
      }

      this.predictions.set(results);
      this.noResults.set(results.length === 0);
      this.isOpen.set(true);
    } catch (err: unknown) {
      if (isDevMode()) {
        console.error(`[AddressAutocomplete:${this.inputId}] fetchPredictions error:`, err);
        if (err instanceof PlacesNotConfiguredError) {
          console.error(
            `[AddressAutocomplete:${this.inputId}] Configuration error — autocomplete disabled.\n` +
            '  → Set googleMapsBrowserKey in src/environments/environment.ts\n' +
            '  → Enable "Maps JavaScript API" and "Places API" in Google Cloud Console\n' +
            '  → Ensure billing is active on the Google Cloud project\n' +
            '  → Add http://localhost:4200/* to the key\'s HTTP referrer restrictions'
          );
        }
      }
      this.sessionToken = null; // reset so next attempt creates a fresh session
      this.apiError.set('Address suggestions are temporarily unavailable. You can still type the address manually.');
      this.close();
    } finally {
      this.isLoading.set(false);
    }
  }

  private async selectPrediction(prediction: PlacePrediction): Promise<void> {
    // Set the description immediately so the input is not blank while we fetch details
    this.control.setValue(prediction.description);
    this.close();

    try {
      const detail = await this.placesService.getPlaceDetail(prediction.placeId, this.sessionToken);
      // Session is complete after getDetails — null it so next session starts fresh
      this.sessionToken = null;

      this.control.setValue(detail.formattedAddress);
      this.control.markAsDirty();

      this.placeSelected.emit({
        address: detail.formattedAddress,
        lat:     detail.lat,
        lng:     detail.lng,
        placeId: detail.placeId,
      });
    } catch {
      // Keep the description as the displayed address — user can still proceed
      this.control.markAsDirty();
      this.placeSelected.emit({
        address: prediction.description,
        lat:     null,
        lng:     null,
        placeId: prediction.placeId,
      });
    }
  }

  private close(): void {
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }

  ngOnDestroy(): void {
    clearTimeout(this.debounceTimer);
  }
}
