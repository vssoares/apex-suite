import { Component, signal } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Slider } from '../../../../shared/ui/slider/slider';
import { Panel } from '../../../../shared/ui/panel/panel';

@Component({
  selector: 'app-tuning-slider-panel',
  imports: [Icon, Slider, Panel],
  templateUrl: './tuning-slider.html',
  styleUrl: './tuning-slider.scss',
})
export class TuningSliderPanel {
  readonly brightness = signal(78);
  readonly contrast = signal(65);
  readonly blackEq = signal(12);
  readonly vibrance = signal(22);
  readonly sharpness = signal(40);

  readonly vibranceFmt = (v: number) => `${v > 0 ? '+' : ''}${v}%`;
  readonly blackEqFmt = (v: number) => `${v} / 20`;
}
