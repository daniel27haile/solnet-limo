import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { COMPANY, SERVICE_TYPES, PAYMENT_METHODS } from '../../../core/constants/app.constants';
import { BookingService } from '../../../core/services/booking.service';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SectionTitleComponent, LoadingSpinnerComponent],
  templateUrl: './booking.component.html',
})
export class BookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);

  company = COMPANY;
  serviceTypes = SERVICE_TYPES;
  paymentMethods = PAYMENT_METHODS;

  submitting = signal(false);
  success = signal(false);
  errorMsg = signal('');

  today = new Date().toISOString().split('T')[0];

  form = this.fb.group({
    fullName:       ['', [Validators.required, Validators.minLength(2)]],
    phone:          ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{7,20}$/)]],
    email:          ['', [Validators.required, Validators.email]],
    pickupLocation: ['', Validators.required],
    dropoffLocation:['', Validators.required],
    serviceType:    ['', Validators.required],
    date:           ['', Validators.required],
    time:           ['', Validators.required],
    passengers:     [null as number | null, [Validators.required, Validators.min(1), Validators.max(20)]],
    paymentMethod:  ['', Validators.required],
    notes:          [''],
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['service']) {
        this.form.patchValue({ serviceType: params['service'] });
      }
    });
  }

  field(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  isInvalid(name: string): boolean {
    const ctrl = this.field(name);
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');

    this.bookingService.submitBooking(this.form.value as any).subscribe({
      next: () => {
        this.success.set(true);
        this.form.reset();
        this.submitting.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.errorMsg.set(
          err?.error?.message || 'Something went wrong. Please try again or call us directly.'
        );
        this.submitting.set(false);
      },
    });
  }
}
