import { Component, Input, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FleetVehicle } from '../../../core/models/fleet.model';
import { COMPANY } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-fleet-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="card" [class.card--inactive]="!vehicle.isActive" role="article">
      <div class="card__picture">
        @if (!vehicle.isActive) {
          <div class="card__unavail-overlay" aria-hidden="true">
            <span class="material-icons">block</span>
            <span>Unavailable</span>
          </div>
        }
        <img
          [src]="vehicleImageUrl"
          [alt]="vehicle.name + ' - Solnet Limo'"
          class="card__image"
          [style.object-fit]="vehicle.imageFit || 'cover'"
          loading="eager"
          (error)="onImageError($event)"
        />
      </div>
      <div class="card__body">
        <div class="card__title-row">
          <h3 class="card__title">{{ vehicle.name }}</h3>
          @if (!vehicle.isActive) {
            <span class="card__unavail-badge">Unavailable</span>
          }
        </div>
        <div class="card__meta">
          <div class="meta-item">
            <span class="material-icons" aria-hidden="true">people</span>
            <span>{{ vehicle.passengers }} Passengers</span>
          </div>
          <div class="meta-item">
            <span class="material-icons" aria-hidden="true">luggage</span>
            <span>{{ vehicle.luggage }} Bags</span>
          </div>
        </div>
        <p class="card__text">{{ vehicle.description }}</p>
        <div class="card__features">
          @for (feature of vehicle.features.slice(0, 4); track feature) {
            <span class="feature-tag">{{ feature }}</span>
          }
          @if (vehicle.features.length > 4) {
            <span class="feature-tag">+{{ vehicle.features.length - 4 }} more</span>
          }
        </div>
      </div>
      <div class="card__footer">
        @if (vehicle.isActive) {
          <a
            routerLink="/booking"
            [queryParams]="{ vehicleType: vehicle.name }"
            class="btn btn-primary btn-sm w-full"
          >Reserve Now</a>
        } @else {
          <button
            class="btn btn-unavail btn-sm w-full"
            (click)="openModal()"
            aria-label="This vehicle is currently unavailable — click for contact options"
          >
            <span class="material-icons" aria-hidden="true">info_outline</span>
            Contact for Availability
          </button>
        }
      </div>
    </article>

    @if (showModal()) {
      <div
        class="unavail-backdrop"
        tabindex="-1"
        (click)="onBackdropClick($event)"
        (keydown.escape)="closeModal()"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unavail-modal-title"
      >
        <div class="unavail-modal">
          <button class="unavail-modal__close" (click)="closeModal()" aria-label="Close">
            <span class="material-icons">close</span>
          </button>

          <div class="unavail-modal__icon">
            <span class="material-icons">directions_car</span>
          </div>

          <h3 class="unavail-modal__title" id="unavail-modal-title">Currently Unavailable</h3>

          <p class="unavail-modal__text">
            The <strong>{{ vehicle.name }}</strong> is not available for booking at this time.
            Please contact us to check availability or discuss alternatives.
          </p>

          <div class="unavail-modal__actions">
            <a
              routerLink="/contact"
              class="btn btn-primary btn-sm"
              (click)="closeModal()"
            >
              <span class="material-icons" aria-hidden="true">mail_outline</span>
              Contact Us
            </a>
            <a [href]="phoneHref" class="btn btn-outline btn-sm">
              <span class="material-icons" aria-hidden="true">phone</span>
              {{ phone }}
            </a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .card--inactive {
      opacity: 0.82;
      filter: saturate(0.55);
    }
    .card--inactive .card__image {
      filter: grayscale(30%);
    }

    .card__picture { position: relative; }

    .card__unavail-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.52);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      z-index: 1;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      pointer-events: none;

      .material-icons { font-size: 2rem; opacity: 0.85; }
    }

    .card__title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .card__unavail-badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      border-radius: 20px;
      background: rgba(180,180,180,0.12);
      color: #888;
      border: 1px solid rgba(180,180,180,0.28);
      white-space: nowrap;
    }

    .btn-unavail {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(140,140,140,0.12);
      color: #888;
      border: 1px solid rgba(140,140,140,0.3);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;

      .material-icons { font-size: 1rem; }

      &:hover {
        background: rgba(140,140,140,0.2);
        border-color: rgba(140,140,140,0.5);
        color: #aaa;
      }
    }

    /* ── Availability modal ───────────────────────────────────────── */
    .unavail-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0,0,0,0.78);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: uFadeIn 0.15s ease forwards;
      outline: none;
    }
    @keyframes uFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .unavail-modal {
      background: #161616;
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: 12px;
      width: 100%;
      max-width: 420px;
      padding: 36px 32px;
      text-align: center;
      position: relative;
      animation: uSlideUp 0.18s ease forwards;

      @media (max-width: 479px) {
        padding: 28px 20px;
        border-radius: 8px;
      }
    }
    @keyframes uSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .unavail-modal__close {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: 1px solid #333;
      border-radius: 6px;
      color: #666;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;

      &:hover { border-color: #666; color: #fff; }
      .material-icons { font-size: 18px; }
    }

    .unavail-modal__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: rgba(140,140,140,0.1);
      border: 1px solid rgba(140,140,140,0.2);
      border-radius: 50%;
      margin: 0 auto 20px;

      .material-icons { font-size: 2rem; color: #888; }
    }

    .unavail-modal__title {
      margin: 0 0 12px;
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
    }

    .unavail-modal__text {
      margin: 0 0 28px;
      font-size: 0.9rem;
      color: #999;
      line-height: 1.7;

      strong { color: #c9a84c; }
    }

    .unavail-modal__actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;

      .btn { min-width: 140px; justify-content: center; gap: 6px; }
      .material-icons { font-size: 1rem; }
    }
  `],
})
export class FleetCardComponent implements OnDestroy {
  @Input({ required: true }) vehicle!: FleetVehicle;

  readonly phone = COMPANY.phone;
  readonly phoneHref = COMPANY.phoneHref;

  showModal = signal(false);

  private readonly defaultFallbackImage = 'assets/images/fleet/default-fleet.jpg';

  get vehicleImageUrl(): string {
    if (this.vehicle.slug) {
      return `assets/images/fleet/${this.vehicle.slug}/${this.vehicle.slug}.jpg`;
    }
    return this.vehicle.image;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null;
    imgElement.src = this.defaultFallbackImage;
  }

  openModal(): void {
    this.showModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal.set(false);
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('unavail-backdrop')) {
      this.closeModal();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
