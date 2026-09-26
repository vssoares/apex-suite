import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SystemInfo } from '../../core/system-info';
import { AppUpdate } from '../../core/app-update';
import { Titlebar } from '../titlebar/titlebar';
import { StatusDot } from '../../shared/ui/status-dot/status-dot';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Titlebar, StatusDot],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  /** Starts live system polling for the whole app shell. */
  private readonly systemInfo = inject(SystemInfo);
  readonly update = inject(AppUpdate);

  installUpdate(): void {
    void this.update.downloadAndInstall();
  }
}
