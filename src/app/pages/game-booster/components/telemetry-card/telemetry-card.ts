import { booleanAttribute, Component, input } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Badge } from '../../../../shared/ui/badge/badge';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import { Button } from '../../../../shared/ui/button/button';
import { Panel } from '../../../../shared/ui/panel/panel';

export type TelemetryKind = 'cpu' | 'gpu' | 'ram' | 'storage';

@Component({
  selector: 'app-telemetry-card',
  imports: [Icon, Badge, ProgressBar, Button, Panel],
  templateUrl: './telemetry-card.html',
  styleUrl: './telemetry-card.scss',
})
export class TelemetryCard {
  readonly kind = input.required<TelemetryKind>();
  readonly title = input.required<string>();
  readonly device = input.required<string>();
  readonly badge = input('');
  readonly icon = input('memory');
  readonly iconColor = input<'primary' | 'emerald' | 'sky' | 'purple'>('primary');
  readonly primaryValue = input('');
  readonly primaryUnit = input('');
  readonly secondary = input('');
  readonly footerLabel = input('');
  readonly footerValue = input('');
  readonly sparkline = input(false, { transform: booleanAttribute });
  readonly bars = input<{ label: string; value: number; tone: 'emerald' | 'sky' }[]>([]);
  readonly segments = input<{ width: number; tone: string }[]>([]);
  readonly legend = input<string[]>([]);
  readonly stats = input<{ label: string; value: string }[]>([]);
  readonly actionLabel = input('');
  readonly actionIcon = input('');
}
