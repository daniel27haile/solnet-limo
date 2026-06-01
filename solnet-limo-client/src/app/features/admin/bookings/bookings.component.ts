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
        <div style="overflow-x:auto;">
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
                    <div>{{ b.fullName }}</div>
                    <div style="font-size:0.8rem; color:#888;">{{ b.email }}</div>
                  </td>
                  <td>{{ b.phone }}</td>
                  <td>{{ b.serviceType }}</td>
                  <td>{{ b.vehicleType }}</td>
                  <td>{{ b.date | date:'mediumDate' }}<br/><span style="color:#888;font-size:0.8rem;">{{ b.time }}</span></td>
                  <td>{{ b.distanceMiles ? (b.distanceMiles + ' mi') : '—' }}</td>
                  <td>{{ b.finalTotal ? ('$' + b.finalTotal.toFixed(2)) : '—' }}</td>
                  <td>
                    <span class="badge" [class]="'badge-' + (b.paymentStatus || 'pending')">
                      {{ b.paymentStatus || 'unpaid' }}
                    </span>
                  </td>
                  <td>
                    <select
                      [ngModel]="b.status"
                      (ngModelChange)="updateStatus(b._id, $event)"
                      style="padding:6px 10px; background:#2a2a2a; border:1px solid rgba(201,168,76,0.2); border-radius:4px; color:#fff; font-size:0.8rem;"
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
