import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-dot',
  template: '',
  host: {
    'class': 'dot',
    '[class.success]': 'tone() === "success"',
    '[class.primary]': 'tone() === "primary"',
    '[class.muted]': 'tone() === "muted"',
    '[class.warning]': 'tone() === "warning"',
    '[class.error]': 'tone() === "error"',
  },
  styles: `
    :host {
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }
    :host(.success) {
      background: var(--emerald);
    }
    :host(.primary) {
      background: var(--primary);
    }
    :host(.muted) {
      background: #64748b;
    }
    :host(.warning) {
      background: var(--warning);
    }
    :host(.error) {
      background: var(--error);
    }
  `,
})
export class StatusDot {
  readonly tone = input<'success' | 'primary' | 'muted' | 'warning' | 'error'>('success');
}
