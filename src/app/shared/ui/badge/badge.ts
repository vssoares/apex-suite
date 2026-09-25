import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  template: `
    <span class="badge" [class]="tone()">
      @if (dot()) {
        <span class="dot"></span>
      }
      <ng-content />
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius);
      font-size: 0.6875rem;
      font-weight: 500;
      line-height: 1.25;
      border: 1px solid transparent;
      white-space: nowrap;
    }
    .dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: var(--radius-full);
      background: currentColor;
    }
    .neutral {
      color: var(--on-surface-variant);
      background: var(--surface-container);
      border-color: var(--outline-variant);
    }
    .primary {
      color: var(--primary);
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      border-color: color-mix(in srgb, var(--primary) 20%, transparent);
    }
    .success {
      color: var(--emerald);
      background: color-mix(in srgb, var(--emerald) 10%, transparent);
      border-color: color-mix(in srgb, var(--emerald) 20%, transparent);
    }
    .warning {
      color: var(--warning);
      background: color-mix(in srgb, var(--warning) 10%, transparent);
      border-color: color-mix(in srgb, var(--warning) 20%, transparent);
    }
  `,
})
export class Badge {
  readonly tone = input<'neutral' | 'primary' | 'success' | 'warning'>('neutral');
  readonly dot = input(false, { transform: booleanAttribute });
}
