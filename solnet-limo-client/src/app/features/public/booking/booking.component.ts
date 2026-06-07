import {
  Component, OnInit, OnDestroy,
  inject, signal, ChangeDetectorRef,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { COMPANY, SERVICE_TYPES } from '../../../core/constants/app.constants';
import { BookingService } from '../../../core/services/booking.service';
import { FleetService } from '../../../core/services/fleet.service';
import { PricingService } from '../../../core/services/pricing.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AddressAutocompleteComponent, AddressSelectedEvent } from '../../../shared/components/address-autocomplete/address-autocomplete.component';
import { FALLBACK_FLEET } from '../../../core/models/fleet.model';
import { PriceCalculation } from '../../../core/models/pricing.model';
import { PaymentConfirmation } from '../../../core/models/payment.model';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ProgressStepperComponent } from '../../../shared/components/progress-stepper/progress-stepper.component';
import { PriceSummaryComponent } from '../../../shared/components/price-summary/price-summary.component';
import { ReviewModalComponent } from '../../../shared/components/review-modal/review-modal.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule,
    SectionTitleComponent, LoadingSpinnerComponent,
    ProgressStepperComponent, PriceSummaryComponent,
    ReviewModalComponent, AddressAutocompleteComponent,
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit, OnDestroy {
  private fb             = inject(FormBuilder);
  private route          = inject(ActivatedRoute);
  private bookingService = inject(BookingService);
  private fleetService   = inject(FleetService);
  private pricingService = inject(PricingService);
  private paymentService = inject(PaymentService);
  private cdr            = inject(ChangeDetectorRef);

  company      = COMPANY;
  serviceTypes = SERVICE_TYPES;
  stepLabels   = ['Trip Info', 'Your Details', 'Review & Price', 'Payment', 'Confirmation'];

  currentStep = signal(0);
  totalSteps  = 4; // 0-indexed; step 4 = confirmation (no nav)

  // Vehicle types
  vehicleTypes          = signal<string[]>(FALLBACK_FLEET.map((v) => v.name));
  loadingVehicles       = signal(true);

  // Pricing
  loadingPrice  = signal(false);
  priceResult   = signal<PriceCalculation | null>(null);
  priceError    = signal('');

  // Payment
  squareReady   = signal(false);
  squareError   = signal('');
  submitting    = signal(false);

  // Confirmation
  confirmation  = signal<PaymentConfirmation | null>(null);

  // Review modal
  showReviewModal = signal(false);

  // Step-level errors
  stepError = signal('');

  today = new Date().toISOString().split('T')[0];

  form = this.fb.group({
    // Step 1: Trip Info
    pickupLocation:  ['', Validators.required],
    pickupLatitude:  [null as number | null],
    pickupLongitude: [null as number | null],
    dropoffLocation: ['', Validators.required],
    serviceType:     ['', Validators.required],
    vehicleType:     ['', Validators.required],
    date:            ['', Validators.required],
    time:            ['', Validators.required],
    passengers:      [null as number | null, [Validators.required, Validators.min(1), Validators.max(20)]],
    // Step 2: Customer Details
    fullName:        ['', [Validators.required, Validators.minLength(2)]],
    phone:           ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{7,20}$/)]],
    email:           ['', [Validators.required, Validators.email]],
    notes:           [''],
  });

  private readonly step1Fields = [
    'pickupLocation', 'dropoffLocation', 'serviceType', 'vehicleType', 'date', 'time', 'passengers',
  ];
  private readonly step2Fields = ['fullName', 'phone', 'email'];

  ngOnInit(): void {
    this.fleetService.getFleet().subscribe({
      next: (data) => {
        if (data.length) this.vehicleTypes.set(data.map((v) => v.name));
        this.loadingVehicles.set(false);
        this.applyQueryParams();
      },
      error: () => {
        this.loadingVehicles.set(false);
        this.applyQueryParams();
      },
    });
  }

  ngOnDestroy(): void {
    this.paymentService.destroyCard().catch(() => {});
  }

  private applyQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['service']) {
        this.form.patchValue({ serviceType: params['service'] });
      }
      if (params['vehicleType']) {
        const match = this.vehicleTypes().find((v) => v === params['vehicleType']);
        if (match) this.form.patchValue({ vehicleType: match });
      }
    });
  }

  // ─── Address Autocomplete Handlers ──────────────────────────────────────

  onPickupSelected(event: AddressSelectedEvent): void {
    this.form.patchValue({
      pickupLocation:  event.address,
      pickupLatitude:  event.lat,
      pickupLongitude: event.lng,
    });
  }

  onDropoffSelected(event: AddressSelectedEvent): void {
    this.form.patchValue({ dropoffLocation: event.address });
  }

  // ─── Step Navigation ─────────────────────────────────────────────────────

  nextStep(): void {
    this.stepError.set('');
    const step = this.currentStep();

    if (step === 0) {
      if (!this.isStepValid(0)) {
        this.markStepTouched(0);
        this.stepError.set('Please fill in all required trip details.');
        return;
      }
      const pickup  = (this.form.value.pickupLocation  ?? '').trim().toLowerCase();
      const dropoff = (this.form.value.dropoffLocation ?? '').trim().toLowerCase();
      if (pickup && dropoff && pickup === dropoff) {
        this.stepError.set('Pickup and drop-off address cannot be the same.');
        return;
      }
      this.currentStep.set(1);
    } else if (step === 1) {
      if (!this.isStepValid(1)) {
        this.markStepTouched(1);
        this.stepError.set('Please fill in all required contact details.');
        return;
      }
      this.currentStep.set(2);
      this.fetchPricing();
    } else if (step === 2) {
      if (!this.priceResult()) {
        this.stepError.set('Please wait for pricing to load before continuing.');
        return;
      }
      this.currentStep.set(3);
      this.initPaymentForm();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevStep(): void {
    this.stepError.set('');
    const step = this.currentStep();
    if (step > 0) {
      this.currentStep.set(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ─── Pricing ─────────────────────────────────────────────────────────────

  private fetchPricing(): void {
    const { pickupLocation, dropoffLocation } = this.form.value;
    if (!pickupLocation || !dropoffLocation) return;

    this.loadingPrice.set(true);
    this.priceError.set('');
    this.priceResult.set(null);

    this.pricingService.calculatePrice(pickupLocation, dropoffLocation).subscribe({
      next: (result) => {
        this.priceResult.set(result);
        this.loadingPrice.set(false);
      },
      error: (err) => {
        if (err.status === 0) {
          this.priceError.set(
            'We could not reach the server. Please check your connection and click Retry.'
          );
        } else {
          this.priceError.set(
            err?.error?.message ||
            'We could not calculate the distance for these addresses. Please check the pickup and destination addresses.'
          );
        }
        this.loadingPrice.set(false);
      },
    });
  }

  retryPricing(): void {
    this.fetchPricing();
  }

  // ─── Payment ─────────────────────────────────────────────────────────────

  private initPaymentForm(): void {
    this.squareReady.set(false);
    this.squareError.set('');

    // Flush Angular's pending changes so #card-container is in the DOM
    // before Square tries to attach to it.
    this.cdr.detectChanges();

    this.paymentService.loadSquareSdk()
      .then(() => this.paymentService.initCard('card-container'))
      .then(() => {
        this.squareReady.set(true);
        this.cdr.detectChanges();
      })
      .catch((err: Error) => {
        this.squareError.set(err.message || 'Payment form could not be loaded.');
      });
  }

  async submitPayment(): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.squareError.set('');

    let sourceId: string;
    try {
      sourceId = await this.paymentService.tokenize();
    } catch (err: any) {
      this.squareError.set(err.message || 'Card tokenization failed. Please try again.');
      this.submitting.set(false);
      return;
    }

    const draft = this.buildBookingDraft();
    this.paymentService.createPayment(draft, sourceId).subscribe({
      next: (result) => {
        this.confirmation.set(result);
        this.currentStep.set(4);
        this.submitting.set(false);
        this.showReviewModal.set(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.squareError.set(
          err?.error?.message || 'Payment failed. Please check your card and try again.'
        );
        this.submitting.set(false);
      },
    });
  }

  private buildBookingDraft() {
    const v = this.form.value;
    return {
      fullName:        v.fullName!,
      phone:           v.phone!,
      email:           v.email!,
      pickupLocation:  v.pickupLocation!,
      pickupLatitude:  v.pickupLatitude ?? undefined,
      pickupLongitude: v.pickupLongitude ?? undefined,
      dropoffLocation: v.dropoffLocation!,
      serviceType:     v.serviceType as any,
      vehicleType:     v.vehicleType!,
      date:            v.date!,
      time:            v.time!,
      passengers:      v.passengers!,
      notes:           v.notes || '',
    };
  }

  // ─── Form helpers ─────────────────────────────────────────────────────────

  field(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  isInvalid(name: string): boolean {
    const ctrl = this.field(name);
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  private isStepValid(step: number): boolean {
    const fields = step === 0 ? this.step1Fields : this.step2Fields;
    return fields.every((f) => this.form.get(f)?.valid);
  }

  private markStepTouched(step: number): void {
    const fields = step === 0 ? this.step1Fields : this.step2Fields;
    fields.forEach((f) => this.form.get(f)?.markAsTouched());
  }

  // ─── Getters for template ─────────────────────────────────────────────────

  closeReviewModal(): void {
    this.showReviewModal.set(false);
  }

  get formValue() {
    return this.form.value;
  }

  get tripDate(): string {
    const d = this.form.value.date;
    if (!d) return '';
    return new Date(d + 'T00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}
