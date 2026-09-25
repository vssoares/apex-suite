import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  template: `<ng-content />`,
  host: {
    'class': 'panel',
    '[class.interactive]': 'interactive()',
    '[class.active]': 'active()',
    '[class.padded]': 'padded()',
  },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--outline-variant);
      border-radius: var(--radius-xl);
    }
    :host(.padded) {
      padding: 1rem;
    }
    :host(.interactive) {
      transition: border-color 0.15s ease;
    }
    :host(.interactive:hover) {
      border-color: var(--outline);
    }
    :host(.active) {
      border-color: color-mix(in srgb, var(--primary-strong) 40%, transparent);
    }
  `,
})
export class Panel {
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly active = input(false, { transform: booleanAttribute });
  readonly padded = input(true, { transform: booleanAttribute });
}
