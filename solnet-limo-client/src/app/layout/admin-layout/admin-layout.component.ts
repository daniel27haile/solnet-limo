import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

const adminNav = [
  { label: 'Dashboard',  path: '/admin/dashboard',           icon: 'dashboard' },
  { label: 'Bookings',   path: '/admin/bookings',            icon: 'event_available' },
  { label: 'Messages',   path: '/admin/messages',            icon: 'mail' },
  { label: 'Services',   path: '/admin/services-management', icon: 'room_service' },
  { label: 'Fleet',      path: '/admin/fleet-management',    icon: 'directions_car' },
  { label: 'Pricing',    path: '/admin/pricing',             icon: 'attach_money' },
  { label: 'Reviews',    path: '/admin/reviews',             icon: 'star_rate' },
] as const;

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="admin-layout">

      <!-- Mobile backdrop — closes menu when tapped -->
      @if (menuOpen()) {
        <div
          class="admin-sidebar-backdrop"
          (click)="closeMenu()"
          aria-hidden="true">
        </div>
      }

      <aside
        id="admin-sidebar"
        class="sidebar"
        [class.sidebar--open]="menuOpen()"
        role="navigation"
        aria-label="Admin navigation">

        <div class="sidebar-brand">
          <span>Solnet Limo</span>
          <small>Admin Portal</small>
        </div>

        <nav>
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              (click)="closeMenu()">
              <span class="material-icons" aria-hidden="true">{{ link.icon }}</span>
              {{ link.label }}
            </a>
          }
        </nav>
      </aside>

      <div class="admin-content">
        <header class="admin-topbar" role="banner">

          <div class="topbar-left">
            <!-- Hamburger — visible only on tablet/mobile via CSS -->
            <button
              class="admin-hamburger"
              (click)="toggleMenu()"
              [attr.aria-expanded]="menuOpen()"
              aria-controls="admin-sidebar"
              aria-label="Toggle navigation menu">
              <span class="material-icons" aria-hidden="true">
                {{ menuOpen() ? 'close' : 'menu' }}
              </span>
            </button>
            <span class="topbar-title">Admin Portal</span>
          </div>

          <div class="topbar-user">
            @if (authService.currentAdmin()) {
              <span class="topbar-username">{{ authService.currentAdmin()?.name }}</span>
            }
            <button (click)="logout()" aria-label="Logout">
              <span class="material-icons" aria-hidden="true">logout</span>
              <span class="topbar-logout-label">Logout</span>
            </button>
          </div>

        </header>

        <div class="admin-body">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  navLinks = adminNav;
  menuOpen = signal(false);

  ngOnInit(): void {
    // Validate the stored token against the server on every admin page load.
    // If the token is expired or revoked, the 401 interceptor calls logout()
    // and redirects cleanly to the login page — no black screen.
    this.authService.getMe().subscribe({ error: () => {} });
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
