import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrap" [class.fullscreen]="fullscreen" role="status" aria-label="Loading">
      <div class="spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      @if (message) {
        <p class="spinner-msg">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      gap: 16px;

      &.fullscreen {
        min-height: 50vh;
      }
    }

    .spinner {
      position: relative;
      width: 48px;
      height: 48px;
    }

    .spinner-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid transparent;
      animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;

      &:nth-child(1) {
        border-top-color: #c9a84c;
        animation-delay: -0.45s;
      }
      &:nth-child(2) {
        border-top-color: rgba(201, 168, 76, 0.6);
        animation-delay: -0.3s;
        inset: 6px;
      }
      &:nth-child(3) {
        border-top-color: rgba(201, 168, 76, 0.3);
        animation-delay: -0.15s;
        inset: 12px;
      }
    }

    .spinner-msg {
      font-size: 0.875rem;
      color: #888;
      margin: 0;
    }

    @keyframes spin {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() message = '';
  @Input() fullscreen = false;
}
