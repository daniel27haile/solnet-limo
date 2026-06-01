import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-title',
  standalone: true,
  template: `
    <div class="section-title" [class.text-center]="centered" [class.light]="light">
      @if (subtitle) {
        <p class="section-subtitle">{{ subtitle }}</p>
      }
      <h2>
        {{ title }}
        @if (highlight) {
          <span class="highlight">{{ highlight }}</span>
        }
      </h2>
      <div class="gold-divider" [class.center]="centered" role="presentation"></div>
      @if (description) {
        <p class="section-description">{{ description }}</p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .section-title {
      margin-bottom: 40px;

      .section-subtitle {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #c9a84c;
        margin-bottom: 12px;
      }

      h2 {
        line-height: 1.15;
        .highlight { color: #c9a84c; }
      }

      .section-description {
        max-width: 560px;
        margin-top: 16px;
        font-size: 1.0625rem;
        line-height: 1.8;
        color: #888;
      }

      &.text-center .section-description {
        margin-left: auto;
        margin-right: auto;
      }
    }
  `],
})
export class SectionTitleComponent {
  @Input() title = '';
  @Input() highlight = '';
  @Input() subtitle = '';
  @Input() description = '';
  @Input() centered = false;
  @Input() light = false;
}
