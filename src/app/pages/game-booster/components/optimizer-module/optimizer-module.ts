import { booleanAttribute, Component, input } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Toggle } from '../../../../shared/ui/toggle/toggle';
import { Panel } from '../../../../shared/ui/panel/panel';
import { Badge } from '../../../../shared/ui/badge/badge';

@Component({
  selector: 'app-optimizer-module',
  imports: [Icon, Toggle, Panel, Badge],
  templateUrl: './optimizer-module.html',
  styleUrl: './optimizer-module.scss',
  host: {
    '[class.wide]': 'wide()',
  },
})
export class OptimizerModule {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly description = input('');
  readonly icon = input('tune');
  readonly iconColor = input<'primary' | 'emerald' | 'amber' | 'purple' | 'sky'>('primary');
  readonly enabled = input(true, { transform: booleanAttribute });
  readonly showToggle = input(true, { transform: booleanAttribute });
  readonly badge = input('');
  readonly footerLabel = input('');
  readonly footerValue = input('');
  readonly wide = input(false, { transform: booleanAttribute });
  readonly metrics = input<{ label: string; value: string }[]>([]);
}
