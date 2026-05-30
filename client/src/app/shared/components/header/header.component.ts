import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NAV_LINKS, COMPANY } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="site-header" [class.scrolled]="scrolled()">
      <a routerLink="/" class="header-brand" aria-label="Solnet Limo Home">
        <div class="brand-text">
          <span class="brand-name">Solnet Limo</span>
          <span class="brand-tagline">Elite Transportation</span>
        </div>
      </a>

      <nav class="header-nav" aria-label="Main navigation">
        @for (link of navLinks; track link.path) {
          <a
            [routerLink]="link.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: link.path === '/' }"
          >{{ link.label }}</a>
        }
      </nav>

      <div class="header-cta">
        <a [href]="company.phoneHref" class="phone-link" aria-label="Call us">
          <span class="material-icons">phone</span>
          {{ company.phone }}
        </a>
        <a routerLink="/booking" class="btn btn-primary btn-sm">Book Now</a>
      </div>

      <button
        class="hamburger"
        [class.open]="mobileOpen()"
        (click)="toggleMobile()"
        [attr.aria-expanded]="mobileOpen()"
        aria-label="Toggle menu"
        aria-controls="mobile-nav"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <!-- Mobile Nav -->
    <div
      id="mobile-nav"
      class="mobile-nav"
      [class.open]="mobileOpen()"
      role="dialog"
      aria-label="Mobile navigation"
    >
      <nav>
        @for (link of navLinks; track link.path) {
          <a
            [routerLink]="link.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: link.path === '/' }"
            (click)="closeMobile()"
          >{{ link.label }}</a>
        }
      </nav>
      <div class="mobile-nav-footer">
        <p>Available 24/7</p>
        <a [href]="company.phoneHref" class="phone">
          <span class="material-icons">phone</span>
          {{ company.phone }}
        </a>
      </div>
    </div>
  `,
})
export class HeaderComponent {
  navLinks = NAV_LINKS;
  company = COMPANY;
  scrolled = signal(false);
  mobileOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 50);
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
    document.body.style.overflow = this.mobileOpen() ? 'hidden' : '';
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
    document.body.style.overflow = '';
  }
}
