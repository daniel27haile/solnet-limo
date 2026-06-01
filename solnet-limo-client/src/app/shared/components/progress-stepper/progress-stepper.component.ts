import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper">
      @for (step of steps; track step; let i = $index) {
        <div class="stepper__step"
             [class.stepper__step--active]="i === currentStep"
             [class.stepper__step--completed]="i < currentStep">
          <div class="stepper__circle">
            @if (i < currentStep) {
              <span class="material-icons">check</span>
            } @else {
              <span>{{ i + 1 }}</span>
            }
          </div>
          <span class="stepper__label">{{ step }}</span>
        </div>
        @if (i < steps.length - 1) {
          <div class="stepper__line" [class.stepper__line--completed]="i < currentStep"></div>
        }
      }
    </div>
  `,
  styleUrls: ['./progress-stepper.component.scss'],
})
export class ProgressStepperComponent {
  @Input({ required: true }) steps: string[] = [];
  @Input({ required: true }) currentStep = 0;
}
