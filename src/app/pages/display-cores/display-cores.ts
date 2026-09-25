import { Component, computed, inject } from '@angular/core';
import { DisplayColor } from '../../core/display-color';
import { DisplayCoresHeader } from './components/page-header/page-header';
import { DisplaySwitcher } from './components/display-switcher/display-switcher';
import { SpecStrip } from './components/spec-strip/spec-strip';
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
  private readonly displayColor = inject(DisplayColor);

  readonly presets = this.displayColor.presets;
  readonly activeProfileId = computed(() => this.displayColor.settings().profileId);
  readonly status = this.displayColor.status;
  readonly applying = this.displayColor.applying;
  readonly activeProfileLabel = this.displayColor.activeProfileLabel;

  readonly displays = computed(() =>
    this.displayColor.displays().map((d) => ({
      id: d.id,
      role: d.label,
      name: d.model,
      panel: d.refreshRate ? `${d.refreshRate}Hz` : d.sizeInch ? `${d.sizeInch}"` : 'Display',
      connection: d.connection,
      resolution: d.resolution,
      active: d.id === this.displayColor.selectedDisplayId(),
      badgeTone: (d.primary ? 'success' : 'neutral') as 'success' | 'neutral',
    })),
  );

  readonly specs = computed(() => {
    const d = this.displayColor.selectedDisplay();
    const s = this.displayColor.settings();
    const resParts = d?.resolution?.split('@') ?? [];
    const resLabel = resParts[0]?.trim() || '—';
    const hz =
      d?.refreshRate != null
        ? `${d.refreshRate.toFixed(1)} Hz`
        : resParts[1]?.trim() || '—';

    return [
      {
        label: 'RESOLUÇÃO',
        value: resLabel,
        detail: hz,
        detailTone: 'primary' as const,
      },
      {
        label: 'TEMPERATURA',
        value: `${s.kelvin}K`,
        detail: s.kelvin === 6500 ? 'D65 Neutro' : s.kelvin < 6500 ? 'Quente' : 'Frio',
        detailTone: 'muted' as const,
      },
      {
        label: 'GAMA',
        value: s.gamma.toFixed(1),
        detail: `Brilho ${s.brightness}%`,
        detailTone: 'muted' as const,
      },
      {
        label: 'VIBRANCE',
        value: `${s.vibrance > 0 ? '+' : ''}${s.vibrance}%`,
        detail: this.displayColor.available() ? 'LUT Ativo' : 'Preview',
        detailTone: 'success' as const,
        icon: 'sync',
      },
    ];
  });

  protected onSelectDisplay(id: string): void {
    this.displayColor.selectDisplay(id);
  }

  protected onSelectPreset(id: string): void {
    const preset = this.presets.find((p) => p.id === id);
    if (preset) this.displayColor.applyPreset(preset);
  }

  protected onResetWindows(): void {
    void this.displayColor.resetToWindows();
  }

  protected onApply(): void {
    void this.displayColor.applyNow();
  }
}
