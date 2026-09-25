import { booleanAttribute, Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Button } from '../../../../shared/ui/button/button';
import { StatusDot } from '../../../../shared/ui/status-dot/status-dot';

@Component({
  selector: 'app-action-footer',
  imports: [Icon, Button, StatusDot],
  templateUrl: './action-footer.html',
  styleUrl: './action-footer.scss',
})
export class ActionFooter {
  readonly profileLabel = input('Perfil ativo');
  readonly status = input('Pronto');
  readonly applying = input(false, { transform: booleanAttribute });
  readonly resetWindows = output<void>();
  readonly applyProfile = output<void>();
}
