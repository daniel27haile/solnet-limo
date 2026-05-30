import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Bookings', path: '/admin/bookings', icon: 'event_available' },
  { label: 'Messages', path: '/admin/messages', icon: 'mail' },
  { label: 'Services', path: '/admin/services-management', icon: 'room_service' },
  { label: 'Fleet', path: '/admin/fleet-management', icon: 'directions_car' },
] as const;

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="sidebar" role="navigation" aria-label="Admin navigation">
        <div class="sidebar-brand">
          <span>Solnet Limo</span>
          <small>Admin Portal</small>
        </div>
        <nav>
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
            >
              <span class="material-icons" aria-hidden="true">{{ link.icon }}</span>
              {{ link.label }}
            </a>
          }
        </nav>
      </aside>

      <div class="admin-content">
        <header class="admin-topbar" role="banner">
          <h1>Admin Portal</h1>
          <div class="topbar-user">
            @if (authService.currentAdmin()) {
              <span>{{ authService.currentAdmin()?.name }}</span>
            }
            <button (click)="logout()">
              <span class="material-icons" aria-hidden="true">logout</span>
              Logout
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
export class AdminLayoutComponent {
  authService = inject(AuthService);
  navLinks = adminNav;

  logout(): void {
    this.authService.logout();
  }
}
