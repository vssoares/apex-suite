import { Component, input, output } from '@angular/core';
import { StatusDot } from '../../../../shared/ui/status-dot/status-dot';
import { Badge } from '../../../../shared/ui/badge/badge';

export interface DisplayItem {
  id: string;
  role: string;
  name: string;
  panel: string;
  connection: string;
  resolution: string;
  active?: boolean;
  badgeTone?: 'success' | 'neutral';
}

@Component({
  selector: 'app-display-switcher',
  imports: [StatusDot, Badge],
  templateUrl: './display-switcher.html',
  styleUrl: './display-switcher.scss',
})
export class DisplaySwitcher {
  readonly displays = input<DisplayItem[]>([]);
  readonly selectDisplay = output<string>();
}
