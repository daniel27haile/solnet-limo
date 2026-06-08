import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, LoadingSpinnerComponent],
  styles: [`
    /* Table shown on tablet+, cards on mobile */
    .bookings-table-wrap { display: block; }
    .booking-cards       { display: none; }

    @media (max-width: 767px) {
      .bookings-table-wrap { display: none; }
      .booking-cards       { display: flex; flex-direction: column; gap: 12px; }
    }

    .booking-card {
      background: #1a1a1a;
      border: 1px solid rgba(201,168,76,0.15);
      border-radius: 8px;
      padding: 16px;
    }

    .booking-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .booking-card__name  { display: block; color: #fff; font-size: 0.9375rem; margin-bottom: 2px; }
    .booking-card__email { display: block; color: #888; font-size: 0.8rem; word-break: break-all; }

    .booking-card__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin-bottom: 14px;
    }

    .booking-card__field { display: flex; flex-direction: column; gap: 2px; font-size: 0.875rem; color: #c0c0c0; }
    .booking-card__label { font-size: 0.7rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.06em; }

    .booking-card__footer {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 12px;
      border-top: 1px solid rgba(201,168,76,0.1);
    }

    /* Status select — shared by table and card */
    .status-select {
      padding: 6px 10px;
      background: #2a2a2a;
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 4px;
      color: #fff;
      font-size: 0.8rem;
      cursor: pointer;
      min-height: 36px;
    }

    /* Delete button in card footer */
    .booking-card__footer .btn-delete {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 8px 14px;
      min-height: 44px;
      background: rgba(220,53,69,0.15);
      color: #dc3545;
      border: 1px solid rgba(220,53,69,0.3);
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      .material-icons { font-size: 0.9rem; }
    }
  `],
  template: `
    <div>
      <div style="margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
        <div>
          <h2 style="color:#fff; font-size:1.5rem;">Bookings</h2>
          <p style="color:#888; font-size:0.875rem;">Manage all booking requests</p>
        </div>
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <select [(ngModel)]="statusFilter" (change)="loadBookings()" style="padding:10px 14px; background:#1a1a1a; border:1px solid rgba(201,168,76,0.3); border-radius:6px; color:#fff; font-size:0.875rem;">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner [fullscreen]="true" />
      } @else if (bookings().length === 0) {
        <div style="text-align:center; padding:60px; color:#888;">No bookings found.</div>
      } @else {
        <!-- Desktop table -->
        <div class="bookings-table-wrap table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Distance</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (b of bookings(); track b._id) {
                <tr>
                  <td>
                    <div style="font-weight:600; color:#fff;">{{ b.fullName }}</div>
                    <div style="font-size:0.78rem; color:#888; word-break:break-all;">{{ b.email }}</div>
                  </td>
                  <td style="white-space:nowrap;">{{ b.phone }}</td>
                  <td>{{ b.serviceType }}</td>
                  <td>{{ b.vehicleType }}</td>
                  <td style="white-space:nowrap;">
                    {{ b.date | date:'mediumDate' }}<br/>
                    <span style="color:#888; font-size:0.78rem;">{{ b.time }}</span>
                  </td>
                  <td style="white-space:nowrap;">{{ b.distanceMiles ? (b.distanceMiles + ' mi') : '—' }}</td>
                  <td style="white-space:nowrap;">{{ b.finalTotal ? ('$' + b.finalTotal.toFixed(2)) : '—' }}</td>
                  <td>
                    <span class="badge" [class]="'badge-' + (b.paymentStatus || 'unpaid')">
                      {{ b.paymentStatus || 'unpaid' }}
                    </span>
                  </td>
                  <td>
                    <select
                      [ngModel]="b.status"
                      (ngModelChange)="updateStatus(b._id, $event)"
                      class="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="btn-delete" (click)="deleteBooking(b._id)" aria-label="Delete booking">
                        <span class="material-icons" aria-hidden="true">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="booking-cards">
          @for (b of bookings(); track b._id) {
            <div class="booking-card">
              <div class="booking-card__header">
                <div>
                  <strong class="booking-card__name">{{ b.fullName }}</strong>
                  <span class="booking-card__email">{{ b.email }}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                  <span class="badge" [class]="'badge-' + (b.status)">{{ b.status }}</span>
                  <span class="badge" [class]="'badge-' + (b.paymentStatus || 'unpaid')">
                    {{ b.paymentStatus || 'unpaid' }}
                  </span>
                </div>
              </div>
              <div class="booking-card__grid">
                <div class="booking-card__field">
                  <span class="booking-card__label">Phone</span>
                  <span>{{ b.phone }}</span>
                </div>
                <div class="booking-card__field">
                  <span class="booking-card__label">Service</span>
                  <span>{{ b.serviceType }}</span>
                </div>
                <div class="booking-card__field">
                  <span class="booking-card__label">Vehicle</span>
                  <span>{{ b.vehicleType }}</span>
                </div>
                <div class="booking-card__field">
                  <span class="booking-card__label">Date & Time</span>
                  <span>{{ b.date | date:'mediumDate' }} · {{ b.time }}</span>
                </div>
                @if (b.distanceMiles) {
                  <div class="booking-card__field">
                    <span class="booking-card__label">Distance</span>
                    <span>{{ b.distanceMiles }} mi</span>
                  </div>
                }
                @if (b.finalTotal) {
                  <div class="booking-card__field">
                    <span class="booking-card__label">Total</span>
                    <span style="color:#c9a84c; font-weight:600;">\${{ b.finalTotal.toFixed(2) }}</span>
                  </div>
                }
              </div>
              <div class="booking-card__footer">
                <select
                  [ngModel]="b.status"
                  (ngModelChange)="updateStatus(b._id, $event)"
                  class="status-select">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button class="btn-delete" (click)="deleteBooking(b._id)" aria-label="Delete booking">
                  <span class="material-icons" aria-hidden="true">delete</span>
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class BookingsComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings = signal<Booking[]>([]);
  loading = signal(true);
  statusFilter = '';

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    const params: any = { page: 1, limit: 50 };
    if (this.statusFilter) params.status = this.statusFilter;

    this.bookingService.getBookings(params).subscribe({
      next: (data) => {
        this.bookings.set(data.bookings || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(id: string, status: string): void {
    this.bookingService.updateStatus(id, status).subscribe({
      next: (updated) => {
        this.bookings.update((list) =>
          list.map((b) => (b._id === id ? { ...b, status: updated.status } : b))
        );
      },
    });
  }

  deleteBooking(id: string): void {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    this.bookingService.deleteBooking(id).subscribe({
      next: () => {
        this.bookings.update((list) => list.filter((b) => b._id !== id));
      },
    });
  }
}
