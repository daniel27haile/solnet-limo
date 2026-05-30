import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../../core/constants/app.constants';
import { FleetService } from '../../../core/services/fleet.service';
import { FleetVehicle } from '../../../core/models/fleet.model';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { FleetCardComponent } from '../../../shared/components/fleet-card/fleet-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [RouterLink, SectionTitleComponent, FleetCardComponent, LoadingSpinnerComponent],
  template: `
    <!-- Page Hero -->
    <div class="page-hero">
      <div class="container">
        <h1>Our <span>Fleet</span></h1>
        <p>A premium collection of luxury vehicles for every occasion</p>
      </div>
    </div>

    <!-- Fleet Grid -->
    <section class="section-dark-soft">
      <div class="container">
        <app-section-title
          subtitle="Luxury Vehicles"
          title="Our "
          highlight="Premium Fleet"
          description="Each vehicle in our fleet is immaculately maintained, professionally appointed, and ready to deliver an exceptional experience."
          [centered]="true"
        />

        @if (loading()) {
          <app-loading-spinner [fullscreen]="true" />
        } @else {
          <div class="grid grid-2 grid-gap-xl">
            @for (vehicle of fleet(); track vehicle._id) {
              <app-fleet-card [vehicle]="vehicle" />
            }
          </div>
        }
      </div>
    </section>

    <!-- Fleet features banner -->
    <section class="section-dark">
      <div class="container">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:32px; text-align:center;">
          @for (feature of fleetFeatures; track feature.label) {
            <div>
              <span class="material-icons" style="font-size:2.5rem; color:#c9a84c; display:block; margin-bottom:12px;" aria-hidden="true">{{ feature.icon }}</span>
              <strong style="display:block; color:#fff; font-size:1rem; margin-bottom:6px;">{{ feature.label }}</strong>
              <p style="font-size:0.875rem;">{{ feature.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="contact-cta">
      <div class="container">
        <app-section-title
          subtitle="Reserve Your Vehicle"
          title="Book Your "
          highlight="Preferred Vehicle"
          [centered]="true"
        />
        <div class="cta-actions">
          <a routerLink="/booking" class="btn btn-primary btn-lg">Book Now</a>
          <a [href]="company.phoneHref" class="btn btn-outline btn-lg">{{ company.phone }}</a>
        </div>
      </div>
    </section>
  `,
})
export class FleetComponent implements OnInit {
  private fleetService = inject(FleetService);
  company = COMPANY;
  fleet = signal<FleetVehicle[]>([]);
  loading = signal(true);

  fleetFeatures = [
    { icon: 'verified', label: 'Fully Insured', text: 'All vehicles are fully insured and regularly inspected.' },
    { icon: 'cleaning_services', label: 'Immaculate Condition', text: 'Vehicles are detailed and cleaned before every ride.' },
    { icon: 'ac_unit', label: 'Climate Controlled', text: 'Stay comfortable in any weather conditions.' },
    { icon: 'wifi', label: 'Wi-Fi Available', text: 'Stay connected during your ride.' },
  ];

  ngOnInit(): void {
    this.fleetService.getFleet().subscribe({
      next: (data) => {
        this.fleet.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
