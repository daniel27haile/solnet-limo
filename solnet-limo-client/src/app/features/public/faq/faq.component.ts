import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY, FAQ_ITEMS } from '../../../core/constants/app.constants';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink, SectionTitleComponent],
  template: `
    <div class="page-hero">
      <div class="container">
        <h1>Frequently Asked <span>Questions</span></h1>
        <p>Everything you need to know about Solnet Limo</p>
      </div>
    </div>

    <section class="section-dark-soft">
      <div class="container">
        <app-section-title
          subtitle="Got Questions?"
          title="We Have "
          highlight="Answers"
          description="Browse our most commonly asked questions. If you don't find what you're looking for, contact us directly."
          [centered]="true"
        />

        <div class="faq-list" role="list">
          @for (item of faqItems; track item.question; let i = $index) {
            <div
              class="faq-item"
              [class.open]="openIndex() === i"
              role="listitem"
            >
              <button
                class="faq-question"
                (click)="toggle(i)"
                [attr.aria-expanded]="openIndex() === i"
                [attr.aria-controls]="'faq-answer-' + i"
              >
                <span>{{ item.question }}</span>
                <span class="material-icons faq-icon" aria-hidden="true">
                  {{ openIndex() === i ? 'remove' : 'add' }}
                </span>
              </button>
              <div
                [id]="'faq-answer-' + i"
                class="faq-answer"
                role="region"
                [attr.aria-hidden]="openIndex() !== i"
              >
                <p>{{ item.answer }}</p>
              </div>
            </div>
          }
        </div>

        <div style="text-align:center; margin-top:60px; padding:40px; background:#111; border:1px solid rgba(201,168,76,0.2); border-radius:8px;">
          <span class="material-icons" style="font-size:2.5rem; color:#c9a84c; display:block; margin-bottom:16px;" aria-hidden="true">contact_support</span>
          <h3>Still Have Questions?</h3>
          <p style="margin:12px auto; max-width:400px;">Our team is available 24/7. Don't hesitate to reach out — we're always happy to help.</p>
          <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center; margin-top:24px;">
            <a [href]="company.phoneHref" class="btn btn-primary">Call {{ company.phone }}</a>
            <a routerLink="/contact" class="btn btn-outline">Send a Message</a>
            <a routerLink="/booking" class="btn btn-ghost">Book Online</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .faq-list {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .faq-item {
      background: #1a1a1a;
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.3s ease;

      &.open {
        border-color: #c9a84c;
      }
    }

    .faq-question {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 24px;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      font-family: 'Montserrat', sans-serif;
      font-size: 1rem;
      font-weight: 500;
      color: #fff;
      transition: color 0.2s ease;

      &:hover { color: #c9a84c; }

      .faq-icon {
        font-size: 1.25rem;
        color: #c9a84c;
        flex-shrink: 0;
        transition: transform 0.3s ease;
      }
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease, padding 0.3s ease;

      p {
        margin: 0;
        padding: 0 24px 20px;
        font-size: 0.9375rem;
        color: #888;
        line-height: 1.8;
      }
    }

    .faq-item.open .faq-answer {
      max-height: 300px;
    }

    .faq-item.open .faq-icon {
      transform: rotate(0deg);
    }
  `],
})
export class FaqComponent {
  company = COMPANY;
  faqItems = FAQ_ITEMS;
  openIndex = signal<number | null>(0);

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
