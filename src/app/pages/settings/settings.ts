import { Component, signal } from '@angular/core';
import { Icon } from '../../shared/ui/icon/icon';
import { Panel } from '../../shared/ui/panel/panel';
import { Toggle } from '../../shared/ui/toggle/toggle';

@Component({
  selector: 'app-settings-page',
  imports: [Icon, Panel, Toggle],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsPage {
  readonly openAtLogin = signal(false);
  readonly openAtLoginAvailable = signal(false);
  readonly appVersion = signal('—');
  readonly status = signal('');

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.getOpenAtLogin) {
      this.openAtLoginAvailable.set(false);
      this.status.set('Disponível apenas no app Electron.');
      return;
    }

    this.openAtLoginAvailable.set(true);
    try {
      const [enabled, version] = await Promise.all([
        api.getOpenAtLogin(),
        api.getAppVersion?.() ?? Promise.resolve('—'),
      ]);
      this.openAtLogin.set(enabled);
      this.appVersion.set(version);
    } catch {
      this.openAtLoginAvailable.set(false);
      this.status.set('Não foi possível ler a configuração de inicialização.');
    }
  }

  protected async onOpenAtLoginChange(enabled: boolean): Promise<void> {
    this.openAtLogin.set(enabled);
    const api = window.electronAPI;
    if (!api?.setOpenAtLogin) return;

    try {
      const applied = await api.setOpenAtLogin(enabled);
      this.openAtLogin.set(applied);
      this.status.set(
        applied
          ? 'Apex Suite iniciará com o Windows (em segundo plano).'
          : 'Inicialização com o Windows desativada.',
      );
    } catch {
      this.openAtLogin.set(!enabled);
      this.status.set('Falha ao alterar inicialização com o Windows.');
    }
  }
}
