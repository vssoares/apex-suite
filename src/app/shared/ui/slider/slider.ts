import { booleanAttribute, Component, computed, input, model, numberAttribute } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-slider',
  imports: [Icon],
  template: `
    <div class="slider-block">
      <div class="header">
        <div class="title">
          @if (icon(); as iconName) {
            <app-icon [name]="iconName" [size]="16" [color]="iconColor()" />
          }
          <span>{{ label() }}</span>
          @if (tag()) {
            <span class="tag">{{ tag() }}</span>
          }
        </div>
        <div class="actions">
          <span class="value mono">{{ displayValue() }}</span>
          @if (showReset()) {
            <button type="button" class="reset" title="Resetar">
              <app-icon name="restart_alt" [size]="14" color="muted" />
            </button>
          }
        </div>
      </div>
      <input
        type="range"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [value]="value()"
        (input)="onInput($event)"
      />
      @if (hints().length) {
        <div class="hints">
          @for (hint of hints(); track hint) {
            <span>{{ hint }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .slider-block {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 0.75rem;
      border-radius: var(--radius-lg);
      background: var(--surface-low);
      border: 1px solid var(--outline-variant);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      font-size: 0.75rem;
    }
    .title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #cbd5e1;
      font-weight: 500;
      flex-wrap: wrap;
    }
    .tag {
      padding: 0.1rem 0.375rem;
      border-radius: var(--radius);
      background: var(--surface-high);
      color: var(--on-surface-variant);
      font-size: 0.625rem;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .value {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
    }
    .reset {
      padding: 0.125rem;
      opacity: 0.7;
    }
    .reset:hover {
      opacity: 1;
    }
    input[type='range'] {
      width: 100%;
      height: 0.375rem;
      appearance: none;
      background: var(--surface-high);
      border-radius: var(--radius-lg);
      accent-color: var(--primary-strong);
      cursor: pointer;
    }
    .hints {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 0.625rem;
      color: var(--on-surface-variant);
    }
    .mono {
      font-family: var(--font-mono);
    }
  `,
})
export class Slider {
  readonly label = input.required<string>();
  readonly icon = input<string>();
  readonly iconColor = input<'default' | 'primary' | 'muted' | 'sky'>('muted');
  readonly tag = input('');
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly unit = input('%');
  readonly prefix = input('');
  readonly showReset = input(true, { transform: booleanAttribute });
  readonly hints = input<string[]>([]);
  readonly formatter = input<(v: number) => string>();
  readonly value = model(50);

  protected readonly displayValue = computed(() => {
    const v = this.value();
    const fmt = this.formatter();
    if (fmt) return fmt(v);
    return `${this.prefix()}${v}${this.unit()}`;
  });

  protected onInput(event: Event): void {
    this.value.set(Number((event.target as HTMLInputElement).value));
  }
}
