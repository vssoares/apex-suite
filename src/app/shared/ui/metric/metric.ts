import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric',
  template: `
    <div class="metric">
      <span class="label">{{ label() }}</span>
      <div class="value-row">
        <span class="value" [class]="tone()">{{ value() }}</span>
        @if (unit()) {
          <span class="unit">{{ unit() }}</span>
        }
      </div>
    </div>
  `,
  styles: `
    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .label {
      font-size: 0.625rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--on-surface-variant);
    }
    .value-row {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }
    .value {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--on-surface);
    }
    .value.success {
      color: var(--emerald);
    }
    .value.primary {
      color: var(--primary);
    }
    .unit {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      color: var(--on-surface-variant);
    }
  `,
})
export class Metric {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input('');
  readonly tone = input<'default' | 'success' | 'primary'>('default');
}
