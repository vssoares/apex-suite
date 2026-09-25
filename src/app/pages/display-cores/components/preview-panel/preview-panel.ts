import { Component, computed, inject } from '@angular/core';
import { DisplayColor } from '../../../../core/display-color';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Button } from '../../../../shared/ui/button/button';
import { Panel } from '../../../../shared/ui/panel/panel';
import { StatusDot } from '../../../../shared/ui/status-dot/status-dot';
import { Badge } from '../../../../shared/ui/badge/badge';

@Component({
  selector: 'app-preview-panel',
  imports: [Icon, Button, Panel, StatusDot, Badge],
  templateUrl: './preview-panel.html',
  styleUrl: './preview-panel.scss',
})
export class PreviewPanel {
  private readonly displayColor = inject(DisplayColor);

  readonly settings = this.displayColor.settings;
  readonly activePreset = this.displayColor.activePreset;

  readonly afterImage =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAHKZu-1Ey3SiXgPkwHIuUXn6QijFCWott2WVkxjZ1bylkHu1vteilq4yRjv_kGPRm5ZLV293lmAsHMidi6vEXQ7gW2phdM2JN9DaIhvNeNqAyXcA0KugFA_96Ckiko8bnTYoDLz1wkhl5YjLg_ICQglsN2a6RMfCdNUrDOS8T5aZwkFwrC5z2KT6uwLMuevOwIiWPFYpvnVyH7vYBhDZ_eRydFKU1uTvxddUvGRmD_g7vGZLmROpG6Qw';
  readonly beforeImage =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCvinRuP56l2h-MsT0NVUNbWNRS7OU3KRWOXB-iCZXWcmd6slxSB90JRfA3uTEV4dSzVoQpfDu0tmmbCxxaCm9WY1vjvyRxUo31q5aqiBOQ3q_-oSFpm-Cle-j-7O3EbON-vrFt_6dfTZzwQIouD3etC3AUCg0DNMAutDcGU5HnWKGlXfwdNPjI35HV5E-sdVAeVxZkV4uYAMg33uRuG785gjoYDNHL56XPGlp8FfIB5hsG-xbNfJmiCA';

  readonly tunedFilter = computed(() => {
    const s = this.settings();
    const brightness = 0.55 + (s.brightness / 100) * 0.9;
    const contrast = 0.7 + (s.contrast / 100) * 0.8;
    const saturate = 1 + s.vibrance / 100;
    const hue =
      s.kelvin < 6500
        ? ((6500 - s.kelvin) / 2000) * -8
        : ((s.kelvin - 6500) / 3000) * 10;
    return `brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)}) saturate(${saturate.toFixed(2)}) hue-rotate(${hue.toFixed(1)}deg)`;
  });

  readonly luminanceLabel = computed(() => {
    const nits = 80 + this.settings().brightness * 3.2;
    return `${nits.toFixed(1)} cd/m²`;
  });

  readonly watermarkLabel = computed(
    () => this.activePreset()?.title ?? 'Ajuste Personalizado',
  );
}
