import { Component, input, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div class="track">
      <div class="fill" [style.width.%]="value()" [class]="tone()"></div>
    </div>
  `,
  styles: `
    .track {
      width: 100%;
      height: 0.375rem;
      border-radius: var(--radius-full);
      background: var(--surface-high);
      overflow: hidden;
    }
    .fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.2s ease;
    }
    .emerald {
      background: var(--emerald);
    }
    .sky {
      background: var(--sky);
    }
    .primary {
      background: var(--primary-strong);
    }
    .purple {
      background: var(--purple);
    }
  `,
})
export class ProgressBar {
  readonly value = input(0, { transform: numberAttribute });
  readonly tone = input<'emerald' | 'sky' | 'primary' | 'purple'>('primary');
}
