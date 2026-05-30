import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { COMPANY, PAYMENT_METHODS } from '../../../core/constants/app.constants';
import { ServicesDataService } from '../../../core/services/services-data.service';
import { FleetService } from '../../../core/services/fleet.service';
import { Service } from '../../../core/models/service.model';
import { FleetVehicle } from '../../../core/models/fleet.model';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { FleetCardComponent } from '../../../shared/components/fleet-card/fleet-card.component';
import { TestimonialCardComponent, Testimonial } from '../../../shared/components/testimonial-card/testimonial-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink, CommonModule, SectionTitleComponent,
    ServiceCardComponent, FleetCardComponent,
    TestimonialCardComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private servicesService = inject(ServicesDataService);
  private fleetService = inject(FleetService);

  company = COMPANY;
  paymentMethods = PAYMENT_METHODS;

  services = signal<Service[]>([]);
  fleet = signal<FleetVehicle[]>([]);
  loadingServices = signal(true);
  loadingFleet = signal(true);

  whyChooseUs = [
    { icon: 'verified', title: 'Professional Chauffeurs', text: 'Fully licensed, background-checked, and trained drivers who prioritize your safety and comfort.' },
    { icon: 'schedule', title: '24/7 Availability', text: 'We never sleep. Available around the clock, every day of the year, for all your transportation needs.' },
    { icon: 'star', title: 'Luxury Fleet', text: 'From premium SUVs to stretch limousines — our vehicles are immaculate, comfortable, and fully equipped.' },
    { icon: 'favorite', title: 'Unforgettable Experience', text: 'We don\'t just transport you — we create memories. Every ride is a premium, personalized experience.' },
  ];

  testimonials: Testimonial[] = [
    { name: 'Jessica M.', location: 'Denver, CO', rating: 5, text: 'Solnet Limo made our wedding day absolutely perfect. The limo was stunning and our driver was incredibly professional.', service: 'Wedding' },
    { name: 'Marcus T.', location: 'Fort Collins, CO', rating: 5, text: 'Used them for airport pickup and drop-off. On time every single time. Will never use another service again!', service: 'Airport Transportation' },
    { name: 'Alicia R.', location: 'Boulder, CO', rating: 5, text: 'My daughter\'s prom night was made extra special thanks to Solnet Limo. She felt like a celebrity!', service: 'Prom' },
    { name: 'David K.', location: 'Greeley, CO', rating: 5, text: 'Exceptional service for our corporate conference. Punctual, discreet, and the vehicles were immaculate.', service: 'Conference' },
    { name: 'Sophia L.', location: 'Loveland, CO', rating: 5, text: 'Booked for our anniversary dinner. The whole evening was elevated. Truly felt like royalty. Thank you!', service: 'Anniversary' },
    { name: 'James B.', location: 'Windsor, CO', rating: 5, text: 'Fast response, great communication, and an amazing ride. Solnet Limo is the definition of elite service.', service: 'Birthday' },
  ];

  ngOnInit(): void {
    this.servicesService.getServices().subscribe({
      next: (data) => {
        this.services.set(data.slice(0, 6));
        this.loadingServices.set(false);
      },
      error: () => this.loadingServices.set(false),
    });

    this.fleetService.getFleet().subscribe({
      next: (data) => {
        this.fleet.set(data.slice(0, 3));
        this.loadingFleet.set(false);
      },
      error: () => this.loadingFleet.set(false),
    });
  }
}
