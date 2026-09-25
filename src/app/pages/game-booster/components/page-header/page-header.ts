import { Component, input } from '@angular/core';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Metric } from '../../../../shared/ui/metric/metric';

@Component({
  selector: 'app-gb-page-header',
  imports: [Badge, Metric],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class GameBoosterHeader {
  readonly title = input('Game Booster & Otimização do Sistema');
  readonly description = input(
    'Monitoramento de hardware de baixa latência, desbloqueio de threads prioritárias e isolamento de processos em nível de kernel.',
  );
  readonly cpuSpeed = input('—');
  readonly cpuUsage = input('—');
  readonly processesIdle = input('—');
  readonly processesTotal = input('—');
}
