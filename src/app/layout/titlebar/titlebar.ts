import { Component, inject } from '@angular/core';
import { AppUpdate } from '../../core/app-update';
import { Icon } from '../../shared/ui/icon/icon';
import { StatusDot } from '../../shared/ui/status-dot/status-dot';

@Component({
  selector: 'app-titlebar',
  imports: [Icon, StatusDot],
  templateUrl: './titlebar.html',
  styleUrl: './titlebar.scss',
  host: {
    style: 'display: contents',
  },
})
export class Titlebar {
  readonly update = inject(AppUpdate);

  minimize(): void {
    window.electronAPI?.minimize();
  }

  maximize(): void {
    window.electronAPI?.maximize();
  }

  close(): void {
    window.electronAPI?.close();
  }

  installUpdate(): void {
    void this.update.downloadAndInstall();
  }
}
