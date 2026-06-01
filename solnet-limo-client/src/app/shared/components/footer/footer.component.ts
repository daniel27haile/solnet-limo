import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY, PAYMENT_METHODS, SERVICE_TYPES } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer" role="contentinfo">
      <div class="site-footer__grid">

        <!-- Brand column -->
        <div class="site-footer__brand">
          <div class="brand-name">Solnet Limo</div>
          <div class="brand-tagline">Elite Transportation Service by Solomon</div>
          <p>{{ company.slogan }}</p>
          <div class="contact-list">
            <a [href]="company.phoneHref" aria-label="Call us">
              <span class="material-icons" aria-hidden="true">phone</span>
              {{ company.phone }}
            </a>
            <a [href]="company.emailHref" aria-label="Email us">
              <span class="material-icons" aria-hidden="true">email</span>
              {{ company.email }}
            </a>
            <span>
              <span class="material-icons" aria-hidden="true">schedule</span>
              {{ company.availability }}
            </span>
          </div>
        </div>

        <!-- Quick links -->
        <div class="site-footer__col">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/services">Services</a></li>
            <li><a routerLink="/fleet">Our Fleet</a></li>
            <li><a routerLink="/booking">Book Now</a></li>
            <li><a routerLink="/contact">Contact</a></li>
            <li><a routerLink="/faq">FAQ</a></li>
          </ul>
        </div>

        <!-- Services -->
        <div class="site-footer__col">
          <h4>Services</h4>
          <ul>
            @for (svc of featuredServices; track svc) {
              <li><a routerLink="/services">{{ svc }}</a></li>
            }
          </ul>
        </div>

        <!-- Payment -->
        <div class="site-footer__col site-footer__payment">
          <h4>We Accept</h4>
          <div class="payment-icons">
            @for (method of paymentMethods; track method) {
              <span>{{ method }}</span>
            }
          </div>
        </div>

      </div>

      <div class="site-footer__bottom">
        <div class="container">
          <p>&copy; {{ currentYear }} Solnet Limo. All rights reserved.</p>
          <div class="availability">
            <span class="dot" aria-hidden="true"></span>
            Available 24/7
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  company = COMPANY;
  paymentMethods = PAYMENT_METHODS;
  currentYear = new Date().getFullYear();

  featuredServices = [
    'Wedding',
    'Prom',
    'Airport Transportation',
    'Conference',
    'Birthday',
    'Anywhere to Anywhere',
  ];
}
