import { Component } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Button } from '../../../../shared/ui/button/button';
import { StatusDot } from '../../../../shared/ui/status-dot/status-dot';

@Component({
  selector: 'app-boost-banner',
  imports: [Icon, Button, StatusDot],
  templateUrl: './boost-banner.html',
  styleUrl: './boost-banner.scss',
})
export class BoostBanner {
  readonly gains = [
    { label: 'FPS Estimado', value: '+24% AVG', tone: 'success' },
    { label: 'Latência Rede', value: '-18 ms Jitter', tone: 'primary' },
    { label: 'Memória Livre', value: '4.2 GB RAM', tone: 'default' },
  ];
}
