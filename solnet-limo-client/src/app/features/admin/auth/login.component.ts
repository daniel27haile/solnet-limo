import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="login-page" role="main">
      <div class="login-card">
        <div class="login-brand">
          <h1>Solnet Limo</h1>
          <p>Admin Portal</p>
        </div>

        <div class="gold-divider center"></div>

        @if (errorMsg()) {
          <div class="alert alert-error" role="alert">{{ errorMsg() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="admin@solnetlimo.com"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              placeholder="Your password"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle"
              (click)="togglePassword()"
              [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
            >
              <span class="material-icons">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="login-footer">
          <a href="/" style="color:#888; font-size:0.875rem;">
            &larr; Back to Website
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0a;
      background-image: radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 70%);
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: #111;
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: 12px;
      padding: 48px 40px;
    }

    .login-brand {
      text-align: center;
      margin-bottom: 16px;

      h1 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 2rem;
        color: #c9a84c;
        margin-bottom: 4px;
      }

      p {
        font-size: 0.75rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        margin: 0;
      }
    }

    .form-group {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(8px);
      background: none;
      border: none;
      cursor: pointer;
      color: #888;
      padding: 4px;

      &:hover { color: #c9a84c; }
      .material-icons { font-size: 1.1rem; }
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.value;

    this.authService.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Invalid credentials. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
