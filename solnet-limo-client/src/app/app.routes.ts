import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public layout
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.component').then((m) => m.HomeComponent),
        title: 'Solnet Limo | Elite Transportation Service',
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/public/about/about.component').then((m) => m.AboutComponent),
        title: 'About Us | Solnet Limo',
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/public/services/services.component').then((m) => m.ServicesComponent),
        title: 'Our Services | Solnet Limo',
      },
      {
        path: 'fleet',
        loadComponent: () =>
          import('./features/public/fleet/fleet.component').then((m) => m.FleetComponent),
        title: 'Our Fleet | Solnet Limo',
      },
      {
        path: 'booking',
        loadComponent: () =>
          import('./features/public/booking/booking.component').then((m) => m.BookingComponent),
        title: 'Book a Ride | Solnet Limo',
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/contact/contact.component').then((m) => m.ContactComponent),
        title: 'Contact Us | Solnet Limo',
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./features/public/faq/faq.component').then((m) => m.FaqComponent),
        title: 'FAQ | Solnet Limo',
      },
    ],
  },

  // Admin layout
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/admin/auth/login.component').then((m) => m.LoginComponent),
        title: 'Admin Login | Solnet Limo',
      },
      {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
            title: 'Dashboard | Solnet Limo Admin',
          },
          {
            path: 'bookings',
            loadComponent: () =>
              import('./features/admin/bookings/bookings.component').then((m) => m.BookingsComponent),
            title: 'Bookings | Solnet Limo Admin',
          },
          {
            path: 'messages',
            loadComponent: () =>
              import('./features/admin/messages/messages.component').then((m) => m.MessagesComponent),
            title: 'Messages | Solnet Limo Admin',
          },
          {
            path: 'services-management',
            loadComponent: () =>
              import('./features/admin/services-management/services-management.component').then(
                (m) => m.ServicesManagementComponent
              ),
            title: 'Services | Solnet Limo Admin',
          },
          {
            path: 'fleet-management',
            loadComponent: () =>
              import('./features/admin/fleet-management/fleet-management.component').then(
                (m) => m.FleetManagementComponent
              ),
            title: 'Fleet | Solnet Limo Admin',
          },
          {
            path: 'pricing',
            loadComponent: () =>
              import('./features/admin/pricing/pricing.component').then((m) => m.PricingComponent),
            title: 'Pricing | Solnet Limo Admin',
          },
          {
            path: 'reviews',
            loadComponent: () =>
              import('./features/admin/reviews/reviews.component').then((m) => m.ReviewsComponent),
            title: 'Reviews | Solnet Limo Admin',
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
        ],
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
