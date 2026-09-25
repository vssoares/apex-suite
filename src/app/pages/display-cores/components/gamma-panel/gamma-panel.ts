import { Component, signal } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Slider } from '../../../../shared/ui/slider/slider';
import { Panel } from '../../../../shared/ui/panel/panel';

@Component({
  selector: 'app-gamma-panel',
  imports: [Icon, Slider, Panel],
  templateUrl: './gamma-panel.html',
  styleUrl: './gamma-panel.scss',
})
export class GammaPanel {
  readonly kelvin = signal(6500);
  readonly channelR = signal(100);
  readonly channelG = signal(98);
  readonly channelB = signal(102);
  readonly selectedGamma = signal('2.2');
  readonly gammas = ['1.8', '2.0', '2.2', '2.4'] as const;

  readonly kelvinFmt = (v: number) => `${v} K`;

  protected onChannel(channel: 'r' | 'g' | 'b', event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (channel === 'r') this.channelR.set(value);
    if (channel === 'g') this.channelG.set(value);
    if (channel === 'b') this.channelB.set(value);
  }
}
