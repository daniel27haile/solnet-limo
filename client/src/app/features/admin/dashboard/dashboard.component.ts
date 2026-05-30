import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { ContactService } from '../../../core/services/contact.service';
import { BookingStats, Booking } from '../../../core/models/booking.model';
import { MessageStats, ContactMessage } from '../../../core/models/contact.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, LoadingSpinnerComponent],
  template: `
    <div class="dashboard">
      <!-- Page Title -->
      <div style="margin-bottom:32px;">
        <h2 style="font-size:1.8rem; color:#fff; margin-bottom:4px;">Dashboard</h2>
        <p style="color:#888; font-size:0.875rem;">Welcome back, Solomon. Here's an overview of Solnet Limo.</p>
      </div>

      @if (loading()) {
        <app-loading-spinner [fullscreen]="true" />
      } @else {
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon gold">
              <span class="material-icons" aria-hidden="true">event_available</span>
            </div>
            <div class="stat-card__value">{{ bookingStats()?.total ?? 0 }}</div>
            <div class="stat-card__label">Total Bookings</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon gold">
              <span class="material-icons" aria-hidden="true">hourglass_empty</span>
            </div>
            <div class="stat-card__value">{{ bookingStats()?.pending ?? 0 }}</div>
            <div class="stat-card__label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon green">
              <span class="material-icons" aria-hidden="true">check_circle</span>
            </div>
            <div class="stat-card__value">{{ bookingStats()?.confirmed ?? 0 }}</div>
            <div class="stat-card__label">Confirmed</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon blue">
              <span class="material-icons" aria-hidden="true">mail</span>
            </div>
            <div class="stat-card__value">{{ messageStats()?.total ?? 0 }}</div>
            <div class="stat-card__label">Total Messages</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon red">
              <span class="material-icons" aria-hidden="true">mark_email_unread</span>
            </div>
            <div class="stat-card__value">{{ messageStats()?.unread ?? 0 }}</div>
            <div class="stat-card__label">Unread Messages</div>
          </div>
        </div>

        <!-- Recent Bookings -->
        <div class="section-box" style="margin-top:40px;">
          <div class="section-box__header">
            <h3>Recent Bookings</h3>
            <a routerLink="/admin/bookings" class="btn btn-outline btn-sm">View All</a>
          </div>
          @if (recentBookings().length === 0) {
            <p style="color:#888; padding:24px 0; text-align:center;">No bookings yet.</p>
          } @else {
            <div style="overflow-x:auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (b of recentBookings(); track b._id) {
                    <tr>
                      <td>{{ b.fullName }}</td>
                      <td>{{ b.serviceType }}</td>
                      <td>{{ b.date | date:'mediumDate' }}</td>
                      <td>
                        <span class="badge" [class]="'badge-' + b.status">{{ b.status }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Recent Messages -->
        <div class="section-box" style="margin-top:32px;">
          <div class="section-box__header">
            <h3>Recent Messages</h3>
            <a routerLink="/admin/messages" class="btn btn-outline btn-sm">View All</a>
          </div>
          @if (recentMessages().length === 0) {
            <p style="color:#888; padding:24px 0; text-align:center;">No messages yet.</p>
          } @else {
            <div style="overflow-x:auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of recentMessages(); track m._id) {
                    <tr>
                      <td>{{ m.name }}</td>
                      <td>{{ m.subject }}</td>
                      <td>{{ m.createdAt | date:'mediumDate' }}</td>
                      <td>
                        <span class="badge" [class]="m.isRead ? 'badge-completed' : 'badge-pending'">
                          {{ m.isRead ? 'Read' : 'Unread' }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
    }

    .section-box {
      background: #111;
      border: 1px solid rgba(201,168,76,0.15);
      border-radius: 8px;
      overflow: hidden;

    }

    .section-box__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(201,168,76,0.1);

      h3 { font-size: 1rem; color: #fff; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private bookingService = inject(BookingService);
  private contactService = inject(ContactService);

  loading = signal(true);
  bookingStats = signal<BookingStats | null>(null);
  messageStats = signal<MessageStats | null>(null);
  recentBookings = signal<Booking[]>([]);
  recentMessages = signal<ContactMessage[]>([]);

  ngOnInit(): void {
    Promise.all([
      this.bookingService.getStats().subscribe((s) => this.bookingStats.set(s)),
      this.contactService.getStats().subscribe((s) => this.messageStats.set(s)),
      this.bookingService.getBookings({ page: 1, limit: 5 }).subscribe((r) =>
        this.recentBookings.set(r.bookings || [])
      ),
      this.contactService.getMessages({ page: 1, limit: 5 }).subscribe((r) =>
        this.recentMessages.set(r.messages || [])
      ),
    ]);
    setTimeout(() => this.loading.set(false), 800);
  }
}
