import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SystemInfo } from '../../core/system-info';
import { Sidebar } from '../sidebar/sidebar';
import { Titlebar } from '../titlebar/titlebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, Titlebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  /** Starts live system polling for the whole app shell. */
  private readonly systemInfo = inject(SystemInfo);
}
