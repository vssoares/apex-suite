import { Component } from '@angular/core';
import { Icon } from '../../shared/ui/icon/icon';
import { Panel } from '../../shared/ui/panel/panel';

@Component({
  selector: 'app-settings-page',
  imports: [Icon, Panel],
  template: `
    <div class="page">
      <app-panel>
        <div class="empty">
          <app-icon name="tune" [size]="32" color="muted" />
          <h1>Configurações</h1>
          <p>Layout placeholder — funcionalidades serão implementadas depois.</p>
        </div>
      </app-panel>
    </div>
  `,
  styles: `
    .page {
      padding-top: 1.5rem;
    }
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 16rem;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }
    p {
      margin: 0;
      font-size: 0.75rem;
      color: var(--on-surface-variant);
    }
  `,
})
export class SettingsPage {}
