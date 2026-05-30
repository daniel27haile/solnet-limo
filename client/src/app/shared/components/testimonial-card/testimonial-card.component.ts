import { Component, Input } from '@angular/core';

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
}

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  template: `
    <article class="testimonial-card" role="article">
      <div class="stars" [attr.aria-label]="testimonial.rating + ' stars'">
        @for (star of stars; track $index) {
          <span class="material-icons star">star</span>
        }
      </div>
      <blockquote>
        <p>"{{ testimonial.text }}"</p>
      </blockquote>
      <footer>
        <div class="author">
          <div class="author-initials" aria-hidden="true">{{ testimonial.name[0] }}</div>
          <div>
            <strong>{{ testimonial.name }}</strong>
            <span>{{ testimonial.location }}</span>
          </div>
        </div>
        <span class="service-badge">{{ testimonial.service }}</span>
      </footer>
    </article>
  `,
  styles: [`
    .testimonial-card {
      background: #1a1a1a;
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 8px;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #c9a84c;
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(201,168,76,0.15);
      }
    }

    .stars {
      display: flex;
      gap: 2px;
      .star { font-size: 1rem; color: #c9a84c; }
    }

    blockquote p {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      font-style: italic;
      color: #c0c0c0;
      line-height: 1.7;
      margin: 0;
    }

    footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid rgba(201,168,76,0.15);
    }

    .author {
      display: flex;
      align-items: center;
      gap: 12px;

      .author-initials {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(201,168,76,0.2);
        border: 1px solid #c9a84c;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: #c9a84c;
        font-size: 1rem;
        flex-shrink: 0;
      }

      strong {
        display: block;
        font-size: 0.9rem;
        color: #fff;
        font-weight: 600;
      }

      span {
        font-size: 0.8rem;
        color: #888;
      }
    }

    .service-badge {
      padding: 4px 12px;
      background: rgba(201,168,76,0.1);
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      color: #c9a84c;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
    }
  `],
})
export class TestimonialCardComponent {
  @Input({ required: true }) testimonial!: Testimonial;

  get stars(): number[] {
    return Array(this.testimonial.rating).fill(0);
  }
}
