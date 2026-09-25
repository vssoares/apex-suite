import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-section-header',
  imports: [Icon],
  template: `
    <div class="section-header">
      <div class="left">
        @if (icon(); as iconName) {
          <app-icon [name]="iconName" [size]="18" [color]="iconColor()" />
        }
        <h3>{{ title() }}</h3>
      </div>
      @if (subtitle()) {
        <span class="subtitle">{{ subtitle() }}</span>
      }
      <div class="actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }
    .left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--on-surface);
    }
    .subtitle {
      font-size: 0.6875rem;
      color: var(--on-surface-variant);
      margin-left: auto;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `,
})
export class SectionHeader {
  readonly title = input.required<string>();
  readonly icon = input<string>();
  readonly iconColor = input<'default' | 'primary' | 'muted'>('primary');
  readonly subtitle = input('');
}
