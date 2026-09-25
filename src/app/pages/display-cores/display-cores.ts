import { Component } from '@angular/core';
import { DisplayCoresHeader } from './components/page-header/page-header';
import { DisplaySwitcher, DisplayItem } from './components/display-switcher/display-switcher';
import { SpecStrip, SpecItem } from './components/spec-strip/spec-strip';
import { ProfileCard } from './components/profile-card/profile-card';
import { TuningSliderPanel } from './components/tuning-slider/tuning-slider';
import { GammaPanel } from './components/gamma-panel/gamma-panel';
import { PreviewPanel } from './components/preview-panel/preview-panel';
import { ActionFooter } from './components/action-footer/action-footer';

@Component({
  selector: 'app-display-cores-page',
  imports: [
    DisplayCoresHeader,
    DisplaySwitcher,
    SpecStrip,
    ProfileCard,
    TuningSliderPanel,
    GammaPanel,
    PreviewPanel,
    ActionFooter,
  ],
  templateUrl: './display-cores.html',
  styleUrl: './display-cores.scss',
})
export class DisplayCoresPage {
  readonly displays: DisplayItem[] = [
    {
      id: '1',
      role: 'DISPLAY 01 [PRIMÁRIO]',
      name: 'ROG Swift PG27AQDM',
      panel: 'OLED 240Hz',
      connection: 'DP 1.4 DSC',
      resolution: '2560x1440 @ 240Hz',
      active: true,
      badgeTone: 'success',
    },
    {
      id: '2',
      role: 'DISPLAY 02 [SECUNDÁRIO]',
      name: 'BenQ ZOWIE XL2546K',
      panel: 'TN 240Hz',
      connection: 'HDMI 2.0',
      resolution: '1920x1080 @ 240Hz',
      active: false,
      badgeTone: 'neutral',
    },
  ];

  readonly specs: SpecItem[] = [
    { label: 'RESOLUÇÃO', value: '1440p', detail: '240.0 Hz', detailTone: 'primary' },
    { label: 'FAIXA DINÂMICA', value: 'HDR10', detail: 'Peak 1000 nits', detailTone: 'muted' },
    { label: 'FORMATO DE COR', value: '10-Bit', detail: 'RGB Full Range', detailTone: 'muted' },
    {
      label: 'SINCRONIA',
      value: 'G-Sync',
      detail: 'Compatível',
      detailTone: 'success',
      icon: 'sync',
    },
  ];
}
