import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../../core/constants/app.constants';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, SectionTitleComponent],
  template: `
    <!-- Page Hero -->
    <div class="page-hero">
      <div class="container">
        <h1>About <span>Solnet Limo</span></h1>
        <p>{{ company.tagline }}</p>
      </div>
    </div>

    <!-- Story Section -->
    <section class="section-dark-soft">
      <div class="container">
        <div class="about-grid">
          <div class="about-image">
            <img
              src="assets/images/about/chauffeur.jpg"
              alt="Professional Solnet Limo chauffeur in front of luxury black SUV"
              loading="lazy"
              (error)="onImageError($event)"
            />
            <div class="about-badge">
              <span class="material-icons" aria-hidden="true">verified</span>
              <div>
                <strong>Trusted & Professional</strong>
                <span>Licensed Chauffeur Service</span>
              </div>
            </div>
          </div>
          <div class="about-content">
            <app-section-title
              subtitle="Our Story"
              title="Elite Transportation "
              highlight="by Solomon"
              description="Solnet Limo was founded with one mission: to deliver an elite transportation experience that creates lasting impressions and memories."
            />
            <p>We believe every ride should feel extraordinary. Whether you are heading to a wedding, the airport, a prom, or simply a night out — you deserve to arrive in style, comfort, and confidence.</p>
            <p style="margin-top:16px;">Our founder Solomon built Solnet Limo on the values of integrity, punctuality, and a relentless commitment to excellence. Every client is treated as a VIP, every vehicle is immaculate, and every chauffeur is a true professional.</p>
            <div class="about-stats">
              <div class="stat-item">
                <strong>24/7</strong>
                <span>Always Available</span>
              </div>
              <div class="stat-item">
                <strong>100%</strong>
                <span>Client Satisfaction</span>
              </div>
              <div class="stat-item">
                <strong>17+</strong>
                <span>Services Offered</span>
              </div>
            </div>
            <div style="margin-top:32px; display:flex; gap:16px; flex-wrap:wrap;">
              <a routerLink="/booking" class="btn btn-primary">Book Your Ride</a>
              <a [href]="company.phoneHref" class="btn btn-outline">Call Us Now</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="section-dark">
      <div class="container">
        <app-section-title
          subtitle="Our Values"
          title="What Drives "
          highlight="Us Forward"
          [centered]="true"
        />
        <div class="grid grid-3" style="margin-top:40px;">
          @for (value of values; track value.title) {
            <div class="why-choose__item">
              <div class="icon-wrap" aria-hidden="true">
                <span class="material-icons">{{ value.icon }}</span>
              </div>
              <h3>{{ value.title }}</h3>
              <p>{{ value.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="contact-cta">
      <div class="container">
        <app-section-title
          subtitle="Ready?"
          title="Experience the "
          highlight="Solnet Difference"
          [centered]="true"
        />
        <div class="cta-actions">
          <a routerLink="/booking" class="btn btn-primary btn-lg">Book Now</a>
          <a routerLink="/contact" class="btn btn-outline btn-lg">Get in Touch</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 60px;
      align-items: center;

      @media (min-width: 992px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .about-image {
      position: relative;

      img {
        width: 100%;
        border-radius: 8px;
        border: 1px solid rgba(201,168,76,0.2);
        aspect-ratio: 4/3;
        object-fit: cover;
      }

      .about-badge {
        position: absolute;
        bottom: -20px;
        right: 24px;
        background: #111;
        border: 1px solid #c9a84c;
        border-radius: 8px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);

        .material-icons { font-size: 2rem; color: #c9a84c; }
        strong { display: block; color: #fff; font-size: 0.9rem; }
        span { font-size: 0.75rem; color: #888; }
      }
    }

    .about-stats {
      display: flex;
      gap: 32px;
      margin-top: 32px;
      flex-wrap: wrap;

      .stat-item {
        text-align: center;

        strong {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: #c9a84c;
          line-height: 1;
        }

        span {
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }
    }
  `],
})
export class AboutComponent {
  company = COMPANY;

  values = [
    { icon: 'verified', title: 'Integrity', text: 'Honest, transparent service with no hidden fees. What we promise, we deliver.' },
    { icon: 'schedule', title: 'Punctuality', text: 'Your time is precious. We track every detail to ensure on-time arrivals, every time.' },
    { icon: 'diamond', title: 'Excellence', text: 'We settle for nothing less than the best — in our vehicles, our drivers, and our service.' },
    { icon: 'security', title: 'Safety', text: 'Your safety is our top priority. All vehicles are maintained to the highest standards.' },
    { icon: 'favorite', title: 'Passion', text: 'We genuinely love what we do, and that passion shows in every ride we provide.' },
    { icon: 'people', title: 'Personalization', text: 'Every client is different. We tailor each experience to your unique needs and preferences.' },
  ];

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/about/chauffeur-placeholder.jpg';
  }
}
