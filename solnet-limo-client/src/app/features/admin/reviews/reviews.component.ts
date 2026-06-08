import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/models/review.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, DatePipe, LoadingSpinnerComponent],
  template: `
    <div>
      <div style="margin-bottom:24px;">
        <h2 style="color:#fff; font-size:1.5rem;">Reviews</h2>
        <p style="color:#888; font-size:0.875rem;">Approve or reject client booking reviews</p>
      </div>

      @if (loading()) {
        <app-loading-spinner [fullscreen]="true" />
      } @else if (reviews().length === 0) {
        <p style="color:#888; text-align:center; padding:48px 0;">No reviews yet.</p>
      } @else {
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of reviews(); track r._id) {
                <tr>
                  <td>
                    <div style="font-weight:600; color:#fff;">{{ r.customerName }}</div>
                    <div style="font-size:0.8rem; color:#888;">{{ r.customerEmail }}</div>
                  </td>
                  <td>
                    <div class="star-display">
                      @for (s of starArray(r.rating); track $index) {
                        <span class="material-icons" style="font-size:1rem; color:#c9a84c;">star</span>
                      }
                    </div>
                  </td>
                  <td style="max-width:260px; white-space:pre-wrap; word-break:break-word; color:#c0c0c0; font-size:0.875rem;">
                    {{ r.comment || '—' }}
                  </td>
                  <td style="font-size:0.875rem;">{{ r.vehicleType || '—' }}</td>
                  <td style="font-size:0.875rem; white-space:nowrap;">{{ r.createdAt | date:'mediumDate' }}</td>
                  <td>
                    <span class="badge" [class]="statusClass(r.status)">{{ r.status }}</span>
                  </td>
                  <td>
                    <div class="table-actions">
                      @if (r.status !== 'approved') {
                        <button
                          class="btn-edit"
                          title="Approve"
                          (click)="updateStatus(r, 'approved')"
                          [disabled]="updating() === r._id"
                        >
                          <span class="material-icons" style="color:#28a745;">check_circle</span>
                        </button>
                      }
                      @if (r.status !== 'rejected') {
                        <button
                          class="btn-delete"
                          title="Reject"
                          (click)="updateStatus(r, 'rejected')"
                          [disabled]="updating() === r._id"
                        >
                          <span class="material-icons">cancel</span>
                        </button>
                      }
                      @if (r.status !== 'pending') {
                        <button
                          class="btn-edit"
                          title="Set Pending"
                          (click)="updateStatus(r, 'pending')"
                          [disabled]="updating() === r._id"
                          style="opacity:0.6;"
                        >
                          <span class="material-icons" style="font-size:1rem;">hourglass_empty</span>
                        </button>
                      }
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
  styles: [`
    .star-display { display: flex; gap: 2px; }
  `],
})
export class ReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);

  reviews = signal<Review[]>([]);
  loading = signal(true);
  updating = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.reviewService.getAllReviewsAdmin().subscribe({
      next: (data) => { this.reviews.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(review: Review, status: 'pending' | 'approved' | 'rejected'): void {
    this.updating.set(review._id);
    this.reviewService.updateStatus(review._id, status).subscribe({
      next: (updated) => {
        this.reviews.update((list) =>
          list.map((r) => r._id === updated._id ? updated : r)
        );
        this.updating.set(null);
      },
      error: () => this.updating.set(null),
    });
  }

  starArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  statusClass(status: string): string {
    if (status === 'approved') return 'badge-confirmed';
    if (status === 'rejected') return 'badge-cancelled';
    return 'badge-pending';
  }
}
