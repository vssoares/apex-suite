import { Component, inject } from '@angular/core';
import { DisplayColor } from '../../../../core/display-color';
import { COLOR_FIELD_DEFAULTS } from '../../../../core/display-color.model';
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
  private readonly displayColor = inject(DisplayColor);

  readonly settings = this.displayColor.settings;
  readonly defaults = COLOR_FIELD_DEFAULTS;

  readonly vibranceFmt = (v: number) => `${v > 0 ? '+' : ''}${v}%`;
  readonly blackEqFmt = (v: number) => `${v} / 20`;

  protected setBrightness(value: number): void {
    this.displayColor.setField('brightness', value);
  }
  protected setContrast(value: number): void {
    this.displayColor.setField('contrast', value);
  }
  protected setBlackEq(value: number): void {
    this.displayColor.setField('blackEq', value);
  }
  protected setVibrance(value: number): void {
    this.displayColor.setField('vibrance', value);
  }
  protected setSharpness(value: number): void {
    this.displayColor.setField('sharpness', value);
  }
  protected reset(field: 'brightness' | 'contrast' | 'blackEq' | 'vibrance' | 'sharpness'): void {
    this.displayColor.resetField(field);
  }
}
