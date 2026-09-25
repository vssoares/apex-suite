import { Component } from '@angular/core';
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
  minimize(): void {
    window.electronAPI?.minimize();
  }

  maximize(): void {
    window.electronAPI?.maximize();
  }

  close(): void {
    window.electronAPI?.close();
  }
}
