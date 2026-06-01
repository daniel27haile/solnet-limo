import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { PricingService } from '../../../core/services/pricing.service';
import { PricingSettings } from '../../../core/models/pricing.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CurrencyPipe, DatePipe, LoadingSpinnerComponent],
  template: `
    <div>
      <div style="margin-bottom:24px;">
        <h2 style="color:#fff; font-size:1.5rem;">Pricing Settings</h2>
        <p style="color:#888; font-size:0.875rem;">Configure mileage-based rates for trip pricing</p>
      </div>

      @if (loading()) {
        <app-loading-spinner [fullscreen]="true" />
      } @else {
        <div style="max-width:560px;">

          @if (successMsg()) {
            <div class="alert alert-success" role="alert">{{ successMsg() }}</div>
          }
          @if (errorMsg()) {
            <div class="alert alert-error" role="alert">{{ errorMsg() }}</div>
          }

          <div class="form-card">
            <form [formGroup]="form" (ngSubmit)="save()" novalidate>

              <div class="form-group">
                <label for="mileageThreshold">Mileage Threshold (miles)</label>
                <input
                  id="mileageThreshold"
                  type="number"
                  formControlName="mileageThreshold"
                  min="1"
                  step="1"
                  placeholder="e.g. 30"
                />
                <small style="color:#888; font-size:0.78rem; margin-top:4px; display:block;">
                  Trips at or below this distance use the short-distance rate.
                </small>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="shortDistanceRate">Short-Distance Rate ($/mile)</label>
                  <input
                    id="shortDistanceRate"
                    type="number"
                    formControlName="shortDistanceRate"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 6.00"
                  />
                </div>
                <div class="form-group">
                  <label for="longDistanceRate">Long-Distance Rate ($/mile)</label>
                  <input
                    id="longDistanceRate"
                    type="number"
                    formControlName="longDistanceRate"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 3.00"
                  />
                </div>
              </div>

              <div class="form-group" style="max-width:180px;">
                <label for="currency">Currency</label>
                <input
                  id="currency"
                  type="text"
                  formControlName="currency"
                  placeholder="USD"
                  maxlength="3"
                />
              </div>

              <!-- Preview -->
              @if (form.valid) {
                <div class="pricing-preview">
                  <span class="material-icons" aria-hidden="true">info</span>
                  <div>
                    <strong>Preview: </strong>
                    trips &#8804; {{ form.value.mileageThreshold }} mi
                    &#8594; {{ form.value.shortDistanceRate | currency:'USD':'symbol':'1.2-2' }}/mi
                    &nbsp;|&nbsp;
                    trips &gt; {{ form.value.mileageThreshold }} mi
                    &#8594; {{ form.value.longDistanceRate | currency:'USD':'symbol':'1.2-2' }}/mi
                  </div>
                </div>
              }

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="form.invalid || saving()"
                >
                  @if (saving()) {
                    <app-loading-spinner />
                    Saving...
                  } @else {
                    <span class="material-icons" aria-hidden="true">save</span>
                    Save Settings
                  }
                </button>
              </div>

            </form>
          </div>

          @if (currentSettings()) {
            <p style="font-size:0.78rem; color:#555; margin-top:12px; text-align:right;">
              Last updated: {{ currentSettings()!.updatedAt | date:'medium' }}
              @if (currentSettings()!.updatedBy) {
                by {{ currentSettings()!.updatedBy }}
              }
            </p>
          }
        </div>
      }
    </div>
  `,
})
export class PricingComponent implements OnInit {
  private pricingService = inject(PricingService);
  private fb = inject(FormBuilder);

  loading         = signal(true);
  saving          = signal(false);
  successMsg      = signal('');
  errorMsg        = signal('');
  currentSettings = signal<PricingSettings | null>(null);

  form = this.fb.group({
    mileageThreshold:  [30, [Validators.required, Validators.min(1)]],
    shortDistanceRate: [6,  [Validators.required, Validators.min(0.01)]],
    longDistanceRate:  [3,  [Validators.required, Validators.min(0.01)]],
    currency:          ['USD', Validators.required],
  });

  ngOnInit(): void {
    this.pricingService.getSettings().subscribe({
      next: (settings) => {
        this.currentSettings.set(settings);
        this.form.patchValue({
          mileageThreshold:  settings.mileageThreshold,
          shortDistanceRate: settings.shortDistanceRate,
          longDistanceRate:  settings.longDistanceRate,
          currency:          settings.currency,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.pricingService.updateSettings(this.form.value as any).subscribe({
      next: (updated) => {
        this.currentSettings.set(updated);
        this.successMsg.set('Pricing settings saved successfully.');
        this.saving.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to save settings. Please try again.');
        this.saving.set(false);
      },
    });
  }
}
