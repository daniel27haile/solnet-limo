import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceCalculation } from '../../../core/models/pricing.model';

@Component({
  selector: 'app-price-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="price-summary">
      <div class="price-summary__header">
        <span class="material-icons" aria-hidden="true">calculate</span>
        <h3>Estimated Price</h3>
      </div>

      <div class="price-summary__rows">
        <div class="price-summary__row">
          <span>Distance</span>
          <strong>{{ pricing.distanceMiles }} miles</strong>
        </div>
        @if (pricing.durationText) {
          <div class="price-summary__row">
            <span>Drive Time</span>
            <strong>{{ pricing.durationText }}</strong>
          </div>
        }
        <div class="price-summary__row">
          <span>Rate Type</span>
          <strong class="badge-type">{{ pricing.pricingType }}</strong>
        </div>
        <div class="price-summary__row">
          <span>Rate</span>
          <strong>\${{ pricing.rateUsed }}/mile</strong>
        </div>
        <div class="price-summary__row price-summary__row--note">
          <span>Threshold</span>
          <span class="note">≤ {{ pricing.mileageThreshold }} mi = \${{ pricing.rateUsed }}/mi rate</span>
        </div>
      </div>

      <div class="price-summary__total">
        <span>Estimated Total</span>
        <strong>\${{ pricing.estimatedTotal.toFixed(2) }} {{ pricing.currency }}</strong>
      </div>

      <p class="price-summary__disclaimer">
        Final amount is verified server-side before charge. Price may vary based on actual route.
      </p>
    </div>
  `,
  styleUrls: ['./price-summary.component.scss'],
})
export class PriceSummaryComponent {
  @Input({ required: true }) pricing!: PriceCalculation;
}
