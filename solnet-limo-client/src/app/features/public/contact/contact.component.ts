import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { COMPANY } from '../../../core/constants/app.constants';
import { ContactService } from '../../../core/services/contact.service';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SectionTitleComponent],
  template: `
    <div class="page-hero">
      <div class="container">
        <h1>Get In <span>Touch</span></h1>
        <p>We'd love to hear from you. Available 24/7 for all inquiries.</p>
      </div>
    </div>

    <section class="section-dark-soft">
      <div class="container">
        <div class="contact-layout">

          <!-- Contact Info -->
          <div class="contact-info">
            <app-section-title
              subtitle="Contact Solnet Limo"
              title="We Are "
              highlight="Here for You"
              description="Reach out anytime. Our team is standing by to assist with bookings, questions, or special requests."
            />

            <div class="info-cards">
              @for (info of contactInfo; track info.label) {
                <div class="info-card">
                  <span class="material-icons" aria-hidden="true">{{ info.icon }}</span>
                  <div>
                    <strong>{{ info.label }}</strong>
                    <a [href]="info.href" [attr.aria-label]="info.label + ': ' + info.value">{{ info.value }}</a>
                  </div>
                </div>
              }
            </div>

            <div class="availability-card">
              <span class="dot" aria-hidden="true"></span>
              <p><strong>Available 24/7</strong><br/>We never close. Call or text anytime.</p>
            </div>
          </div>

          <!-- Form -->
          <div class="contact-form-wrap">
            @if (success()) {
              <div class="alert alert-success" role="alert">
                <strong>Message Sent!</strong> Thank you for reaching out. We will respond to you shortly.
              </div>
            }

            @if (errorMsg()) {
              <div class="alert alert-error" role="alert">{{ errorMsg() }}</div>
            }

            <div class="form-card">
              <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                <div class="form-row">
                  <div class="form-group">
                    <label for="name">Your Name *</label>
                    <input id="name" type="text" formControlName="name" placeholder="Full name" />
                    @if (field('name').invalid && field('name').touched) {
                      <span class="field-error" role="alert">Name is required</span>
                    }
                  </div>
                  <div class="form-group">
                    <label for="email">Email Address *</label>
                    <input id="email" type="email" formControlName="email" placeholder="your@email.com" />
                    @if (field('email').invalid && field('email').touched) {
                      <span class="field-error" role="alert">Valid email is required</span>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label for="phone">Phone Number</label>
                  <input id="phone" type="tel" formControlName="phone" placeholder="Optional" />
                </div>

                <div class="form-group">
                  <label for="subject">Subject *</label>
                  <input id="subject" type="text" formControlName="subject" placeholder="How can we help?" />
                  @if (field('subject').invalid && field('subject').touched) {
                    <span class="field-error" role="alert">Subject is required</span>
                  }
                </div>

                <div class="form-group">
                  <label for="message">Message *</label>
                  <textarea id="message" formControlName="message" rows="6" placeholder="Tell us more..."></textarea>
                  @if (field('message').invalid && field('message').touched) {
                    <span class="field-error" role="alert">Message is required</span>
                  }
                </div>

                <button type="submit" class="btn btn-primary btn-full" [disabled]="submitting()">
                  @if (submitting()) {
                    Sending...
                  } @else {
                    <span class="material-icons" aria-hidden="true">send</span>
                    Send Message
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 60px;
      align-items: start;

      @media (min-width: 992px) {
        grid-template-columns: 1fr 1.5fr;
      }
    }

    .info-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 32px 0;
    }

    .info-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #1a1a1a;
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 8px;

      .material-icons {
        font-size: 1.5rem;
        color: #c9a84c;
        flex-shrink: 0;
      }

      strong {
        display: block;
        font-size: 0.8rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 4px;
      }

      a {
        color: #fff;
        font-size: 1rem;
        font-weight: 500;
        &:hover { color: #c9a84c; }
      }
    }

    .availability-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(201,168,76,0.05);
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 8px;

      .dot {
        width: 10px;
        height: 10px;
        background: #28a745;
        border-radius: 50%;
        flex-shrink: 0;
        animation: pulse 2s infinite;
      }

      p { margin: 0; font-size: 0.9rem; color: #c0c0c0; }
      strong { color: #c9a84c; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
  `],
})
export class ContactComponent implements OnDestroy {
  private successTimer?: ReturnType<typeof setTimeout>;
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  company = COMPANY;

  submitting = signal(false);
  success = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    phone:   [''],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  contactInfo = [
    { icon: 'phone', label: 'Phone / Text', value: COMPANY.phone, href: COMPANY.phoneHref },
    { icon: 'email', label: 'Email', value: COMPANY.email, href: COMPANY.emailHref },
    { icon: 'schedule', label: 'Availability', value: COMPANY.availability, href: '#' },
  ];

  field(name: string) { return this.form.get(name)!; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.errorMsg.set('');

    this.contactService.submitMessage(this.form.value as any).subscribe({
      next: () => {
        this.success.set(true);
        this.form.reset();
        this.submitting.set(false);
        clearTimeout(this.successTimer);
        this.successTimer = setTimeout(() => this.success.set(false), 4000);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to send. Please call us directly.');
        this.submitting.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.successTimer);
  }
}
