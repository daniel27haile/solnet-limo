import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../../core/constants/app.constants';
import { ServicesDataService } from '../../../core/services/services-data.service';
import { Service } from '../../../core/models/service.model';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, SectionTitleComponent, ServiceCardComponent, LoadingSpinnerComponent],
  template: `
    <!-- Page Hero -->
    <div class="page-hero">
      <div class="container">
        <h1>Our <span>Services</span></h1>
        <p>Premium transportation for every occasion, available 24/7</p>
      </div>
    </div>

    <!-- Services Grid -->
    <section class="section-dark-soft">
      <div class="container">
        <app-section-title
          subtitle="What We Offer"
          title="Premium "
          highlight="Transportation Services"
          description="From intimate celebrations to large corporate events — we have the perfect transportation solution for every occasion."
          [centered]="true"
        />

        @if (loading()) {
          <app-loading-spinner [fullscreen]="true" />
        } @else if (services().length === 0) {
          <p style="text-align:center; color:#888; padding:40px 0;">Services loading... Please try again shortly.</p>
        } @else {
          <div class="services-grid">
            @for (service of services(); track service._id) {
              <app-service-card [service]="service" />
            }
          </div>
        }
      </div>
    </section>

    <!-- Anywhere to Anywhere -->
    <section class="section-dark">
      <div class="container">
        <div class="anywhere-section">
          <span class="material-icons" aria-hidden="true">explore</span>
          <h2>Anywhere to <span style="color:#c9a84c">Anywhere</span></h2>
          <p>Whatever your destination — near or far — we will get you there in style. No trip is too short or too long. Our service extends wherever you need to go.</p>
          <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <a routerLink="/booking" class="btn btn-primary btn-lg">Book Your Ride</a>
            <a [href]="company.phoneHref" class="btn btn-outline btn-lg">Call {{ company.phone }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="contact-cta">
      <div class="container">
        <app-section-title
          subtitle="Ready to Ride?"
          title="Book Your "
          highlight="Experience Today"
          [centered]="true"
        />
        <div class="cta-actions">
          <a routerLink="/booking" class="btn btn-primary btn-lg">Reserve Now</a>
          <a routerLink="/contact" class="btn btn-outline btn-lg">Contact Us</a>
        </div>
      </div>
    </section>
  `,
})
export class ServicesComponent implements OnInit {
  private servicesService = inject(ServicesDataService);
  company = COMPANY;
  services = signal<Service[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.servicesService.getServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
