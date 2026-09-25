import { booleanAttribute, Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Panel } from '../../../../shared/ui/panel/panel';

@Component({
  selector: 'app-profile-card',
  imports: [Icon, Badge, Panel],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
  host: {
    '(click)': 'select.emit()',
    style: 'cursor: pointer; display: block;',
  },
})
export class ProfileCard {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly icon = input('verified');
  readonly active = input(false, { transform: booleanAttribute });
  readonly builtin = input(true, { transform: booleanAttribute });
  readonly code = input('');
  readonly leftLabel = input('');
  readonly leftValue = input('');
  readonly rightLabel = input('');
  readonly rightValue = input('');
  readonly rightTone = input<'default' | 'primary'>('default');
  readonly select = output<void>();
  readonly edit = output<void>();
  readonly remove = output<void>();

  protected onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit();
  }

  protected onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit();
  }
}
