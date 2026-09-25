import { Component, inject } from '@angular/core';
import { DisplayColor } from '../../../../core/display-color';
import { COLOR_FIELD_DEFAULTS } from '../../../../core/display-color.model';
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
  private readonly displayColor = inject(DisplayColor);

  readonly settings = this.displayColor.settings;
  readonly defaults = COLOR_FIELD_DEFAULTS;
  readonly gammas = [1.8, 2.0, 2.2, 2.4] as const;

  readonly kelvinFmt = (v: number) => `${v} K`;

  protected setGamma(value: number): void {
    this.displayColor.setField('gamma', value);
  }

  protected setKelvin(value: number): void {
    this.displayColor.setField('kelvin', value);
  }

  protected onChannel(channel: 'channelR' | 'channelG' | 'channelB', event: Event): void {
    this.displayColor.setField(channel, Number((event.target as HTMLInputElement).value));
  }

  protected reset(
    field: 'gamma' | 'kelvin' | 'channelR' | 'channelG' | 'channelB',
  ): void {
    this.displayColor.resetField(field);
  }
}
