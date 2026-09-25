import { booleanAttribute, Component, input, numberAttribute } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-button',
  imports: [Icon],
  template: `
    <button class="btn" [class]="variant()" [class.block]="block()" type="button">
      @if (icon(); as iconName) {
        <app-icon [name]="iconName" [size]="iconSize()" />
      }
      <span><ng-content /></span>
    </button>
  `,
  styles: `
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      border-radius: var(--radius-lg);
      font-size: 0.75rem;
      font-weight: 500;
      transition:
        background 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
      border: 1px solid transparent;
      white-space: nowrap;
    }
    .block {
      width: 100%;
    }
    .primary {
      background: var(--primary-strong);
      color: #fff;
    }
    .primary:hover {
      background: var(--primary);
    }
    .secondary {
      background: var(--surface-container);
      border-color: var(--outline-variant);
      color: var(--on-surface);
    }
    .secondary:hover {
      background: var(--surface-high);
      border-color: var(--outline);
    }
    .ghost {
      background: var(--surface-high);
      border-color: var(--outline-variant);
      color: var(--on-surface);
    }
    .ghost:hover {
      background: var(--surface-highest);
    }
    .danger {
      background: var(--surface-container);
      border-color: var(--outline-variant);
      color: var(--on-surface-variant);
    }
    .danger:hover {
      color: var(--error);
      background: color-mix(in srgb, var(--error) 10%, transparent);
    }
    .boost {
      background: #0ea5e9;
      color: #020617;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.75rem 1.5rem;
    }
    .boost:hover {
      background: #38bdf8;
    }
  `,
})
export class Button {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger' | 'boost'>('secondary');
  readonly icon = input<string>();
  readonly iconSize = input(16, { transform: numberAttribute });
  readonly block = input(false, { transform: booleanAttribute });
}
