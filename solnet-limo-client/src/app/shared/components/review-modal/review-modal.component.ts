import { Component, OnDestroy, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { CreateReviewDto } from '../../../core/models/review.model';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="review-overlay" role="dialog" aria-modal="true" aria-labelledby="review-title">
      <div class="review-modal">

        <!-- Close button -->
        <button class="review-modal__close" type="button" (click)="close()" aria-label="Close review">
          <span class="material-icons">close</span>
        </button>

        @if (submitted()) {
          <!-- Success state -->
          <div class="review-modal__success">
            <span class="material-icons review-modal__success-icon">check_circle</span>
            <h3>Thank You!</h3>
            <p>Your review has been submitted and is pending approval.</p>
            <button class="btn btn-primary btn-sm" type="button" (click)="close()">Done</button>
          </div>
        } @else {
          <!-- Rating form -->
          <div class="review-modal__icon">
            <span class="material-icons">star_rate</span>
          </div>
          <h3 id="review-title" class="review-modal__title">How was your booking experience?</h3>
          <p class="review-modal__sub">Your feedback helps others choose with confidence.</p>

          <!-- Stars -->
          <div class="review-modal__stars" role="group" aria-label="Star rating">
            @for (star of stars; track star) {
              <button
                type="button"
                class="star-btn"
                [class.star-filled]="star <= (hoverRating() || selectedRating())"
                (click)="selectRating(star)"
                (mouseenter)="hoverStar(star)"
                (mouseleave)="clearHover()"
                [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')"
                [attr.aria-pressed]="star === selectedRating()"
              >
                <span class="material-icons">star</span>
              </button>
            }
          </div>

          @if (selectedRating() > 0) {
            <p class="review-modal__rating-label">{{ ratingLabel() }}</p>
          }

          <!-- Optional comment — shown once a star is selected -->
          @if (selectedRating() > 0) {
            <div class="review-modal__comment">
              <label for="review-comment">Add a comment <span class="optional">(optional)</span></label>
              <textarea
                id="review-comment"
                [(ngModel)]="comment"
                rows="3"
                maxlength="1000"
                placeholder="Tell us about your experience..."
              ></textarea>
            </div>
          }

          @if (errorMsg()) {
            <p class="review-modal__error" role="alert">{{ errorMsg() }}</p>
          }

          <!-- Actions -->
          <div class="review-modal__actions">
            <button
              type="button"
              class="btn btn-primary"
              (click)="submit()"
              [disabled]="submitting() || selectedRating() === 0"
            >
              @if (submitting()) { Submitting... } @else { Submit Review }
            </button>
            <button type="button" class="btn btn-ghost" (click)="close()">Skip</button>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .review-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .review-modal {
      position: relative;
      background: #1a1a1a;
      border: 1px solid rgba(201, 168, 76, 0.3);
      border-radius: 12px;
      padding: 40px 32px 32px;
      width: 100%;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      animation: modalIn 0.25s ease;

      @media (max-width: 480px) {
        padding: 32px 20px 24px;
      }
    }

    @keyframes modalIn {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .review-modal__close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: #888;
      padding: 6px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s, background 0.2s;

      &:hover {
        color: #fff;
        background: rgba(255,255,255,0.08);
      }

      .material-icons { font-size: 1.25rem; }
    }

    .review-modal__icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      background: rgba(201, 168, 76, 0.1);
      border: 1px solid rgba(201, 168, 76, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .material-icons { font-size: 1.75rem; color: #c9a84c; }
    }

    .review-modal__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.4rem;
      color: #fff;
      margin-bottom: 8px;
    }

    .review-modal__sub {
      font-size: 0.875rem;
      color: #888;
      margin-bottom: 24px;
    }

    .review-modal__stars {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-bottom: 12px;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #444;
      transition: color 0.15s, transform 0.15s;

      .material-icons { font-size: 2.25rem; }

      &:hover, &.star-filled {
        color: #c9a84c;
        transform: scale(1.15);
      }
    }

    .review-modal__rating-label {
      font-size: 0.875rem;
      color: #c9a84c;
      font-weight: 600;
      margin-bottom: 20px;
      min-height: 1.2em;
    }

    .review-modal__comment {
      text-align: left;
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 0.875rem;
        color: #c0c0c0;
        margin-bottom: 8px;

        .optional { color: #666; font-size: 0.8rem; }
      }

      textarea {
        width: 100%;
        background: #111;
        border: 1px solid rgba(201, 168, 76, 0.2);
        border-radius: 6px;
        color: #fff;
        padding: 10px 14px;
        font-size: 0.9rem;
        resize: vertical;
        font-family: inherit;
        transition: border-color 0.2s;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: rgba(201, 168, 76, 0.5);
        }

        &::placeholder { color: #555; }
      }
    }

    .review-modal__error {
      font-size: 0.875rem;
      color: #dc3545;
      margin-bottom: 16px;
    }

    .review-modal__actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;

      .btn { min-width: 130px; }
    }

    .review-modal__success {
      padding: 16px 0 8px;

      &-icon {
        font-size: 3.5rem;
        color: #28a745;
        display: block;
        margin-bottom: 16px;
      }

      h3 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.6rem;
        color: #fff;
        margin-bottom: 10px;
      }

      p {
        font-size: 0.9rem;
        color: #888;
        margin-bottom: 24px;
      }
    }
  `],
})
export class ReviewModalComponent implements OnDestroy {
  private closeTimer?: ReturnType<typeof setTimeout>;
  @Input({ required: true }) bookingId!: string;
  @Input({ required: true }) customerName!: string;
  @Input({ required: true }) customerEmail!: string;
  @Input() vehicleType = '';
  @Output() closed = new EventEmitter<void>();

  private reviewService = inject(ReviewService);

  readonly stars = [1, 2, 3, 4, 5];
  readonly ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  hoverRating  = signal(0);
  selectedRating = signal(0);
  comment      = '';
  submitting   = signal(false);
  submitted    = signal(false);
  errorMsg     = signal('');

  selectRating(rating: number): void {
    this.selectedRating.set(rating);
    this.errorMsg.set('');
  }

  hoverStar(rating: number): void {
    this.hoverRating.set(rating);
  }

  clearHover(): void {
    this.hoverRating.set(0);
  }

  ratingLabel(): string {
    return this.ratingLabels[this.selectedRating()] ?? '';
  }

  submit(): void {
    if (this.selectedRating() === 0) {
      this.errorMsg.set('Please select a star rating before submitting.');
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');

    const dto: CreateReviewDto = {
      bookingId:     this.bookingId,
      customerName:  this.customerName,
      customerEmail: this.customerEmail,
      rating:        this.selectedRating(),
      comment:       this.comment.trim() || undefined,
      vehicleType:   this.vehicleType || undefined,
    };

    this.reviewService.createReview(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        clearTimeout(this.closeTimer);
        this.closeTimer = setTimeout(() => this.close(), 4000);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.message || 'Something went wrong. Please try again.');
      },
    });
  }

  close(): void {
    clearTimeout(this.closeTimer);
    this.closed.emit();
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
  }
}
