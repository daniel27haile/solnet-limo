import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="service-card" role="article">
      <div class="service-icon" aria-hidden="true">
        <span class="material-icons">{{ service.icon }}</span>
      </div>
      <h3>{{ service.title }}</h3>
      <p>{{ service.description }}</p>
      <a routerLink="/booking" [queryParams]="{ service: service.title }" class="btn btn-outline btn-sm">
        Book This Service
      </a>
    </article>
  `,
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: Service;
}
