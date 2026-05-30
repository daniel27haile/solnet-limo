import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FleetVehicle } from '../../../core/models/fleet.model';

@Component({
  selector: 'app-fleet-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="card" role="article">
      <img
        [src]="vehicle.image"
        [alt]="vehicle.name + ' - Solnet Limo'"
        class="card__image"
        loading="lazy"
        (error)="onImageError($event)"
      />
      <div class="card__body">
        <h3 class="card__title">{{ vehicle.name }}</h3>
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
        <a routerLink="/booking" class="btn btn-primary btn-sm w-full">Reserve Now</a>
      </div>
    </article>
  `,
})
export class FleetCardComponent {
  @Input({ required: true }) vehicle!: FleetVehicle;

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/fleet/default-vehicle.jpg';
  }
}
