import { Component, computed, inject } from '@angular/core';
import { SystemInfo } from '../../core/system-info';
import { formatGb, formatGhz, formatPercent, formatTemp } from '../../core/system-format';
import { GameBoosterHeader } from './components/page-header/page-header';
import { BoostBanner } from './components/boost-banner/boost-banner';
import { TelemetryCard } from './components/telemetry-card/telemetry-card';
import { OptimizerModule } from './components/optimizer-module/optimizer-module';
import { GameCard } from './components/game-card/game-card';
import { SectionHeader } from '../../shared/ui/section-header/section-header';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-game-booster-page',
  imports: [
    GameBoosterHeader,
    BoostBanner,
    TelemetryCard,
    OptimizerModule,
    GameCard,
    SectionHeader,
    Button,
  ],
  templateUrl: './game-booster.html',
  styleUrl: './game-booster.scss',
})
export class GameBoosterPage {
  private readonly systemInfo = inject(SystemInfo);

  readonly snapshot = this.systemInfo.snapshot;

  readonly cpuSpeed = computed(() => formatGhz(this.snapshot().cpu.speedGhz));
  readonly cpuUsage = computed(() => String(Math.round(this.snapshot().cpu.usagePercent)));
  readonly processesIdle = computed(() => String(this.snapshot().processes.sleeping));
  readonly processesTotal = computed(() => String(this.snapshot().processes.total || '—'));

  readonly cpuDevice = computed(() => this.snapshot().cpu.brand.toUpperCase());
  readonly cpuBadge = computed(
    () => `${this.snapshot().cpu.physicalCores}C / ${this.snapshot().cpu.cores}T`,
  );
  readonly cpuTemp = computed(() => formatTemp(this.snapshot().cpu.temperatureC));
  readonly cpuSecondary = computed(
    () => `${Math.round(this.snapshot().cpu.usagePercent)}% Uso`,
  );

  readonly gpuDevice = computed(() => (this.snapshot().gpu?.model ?? 'GPU não detectada').toUpperCase());
  readonly gpuUsage = computed(() => {
    const usage = this.snapshot().gpu?.usagePercent;
    return usage == null ? '—' : `${Math.round(usage)}%`;
  });
  readonly gpuVram = computed(() => {
    const gpu = this.snapshot().gpu;
    if (!gpu) return 'VRAM: —';
    const used = gpu.vramUsedGb != null ? formatGb(gpu.vramUsedGb) : '—';
    return `VRAM: ${used}/${formatGb(gpu.vramTotalGb)} GB`;
  });
  readonly gpuBars = computed(() => {
    const gpu = this.snapshot().gpu;
    return [
      {
        label: 'Utilização',
        value: gpu?.usagePercent ?? 0,
        tone: 'emerald' as const,
      },
      {
        label: 'Ventoinhas',
        value: gpu?.fanPercent ?? 0,
        tone: 'sky' as const,
      },
    ];
  });
  readonly gpuFooter = computed(() => {
    const gpu = this.snapshot().gpu;
    if (!gpu) return '—';
    return formatTemp(gpu.temperatureC);
  });

  readonly ramDevice = computed(() => {
    const mem = this.snapshot().memory;
    const type = mem.type ?? 'RAM';
    const clock = mem.clockMhz ? ` ${mem.clockMhz}MHz` : '';
    return `${formatGb(mem.totalGb, 0)} GB ${type}${clock}`;
  });
  readonly ramUsed = computed(() => formatGb(this.snapshot().memory.usedGb));
  readonly ramTotal = computed(() => `/ ${formatGb(this.snapshot().memory.totalGb, 0)} GB`);
  readonly ramPercent = computed(() => formatPercent(this.snapshot().memory.usagePercent));
  readonly ramSegments = computed(() => {
    const mem = this.snapshot().memory;
    const used = Math.min(mem.usagePercent, 100);
    const cachedShare =
      mem.totalGb > 0 ? Math.min((mem.cachedGb / mem.totalGb) * 100, 100 - used) : 0;
    const free = Math.max(100 - used - cachedShare, 0);
    return [
      { width: used, tone: '#0ea5e9' },
      { width: cachedShare, tone: 'color-mix(in srgb, #a78bfa 80%, transparent)' },
      { width: free, tone: 'var(--surface-highest)' },
    ];
  });
  readonly ramLegend = computed(() => {
    const mem = this.snapshot().memory;
    return [
      `Em uso ${formatGb(mem.usedGb)}G`,
      `Cache ${formatGb(mem.cachedGb)}G`,
      `Livre ${formatGb(mem.freeGb)}G`,
    ];
  });

  readonly storageTitle = computed(() => {
    const storage = this.snapshot().storage;
    if (!storage) return 'Armazenamento';
    return storage.interfaceType === 'NVMe' ? 'NVMe SSD' : `${storage.type} Storage`;
  });
  readonly storageDevice = computed(() =>
    (this.snapshot().storage?.name ?? 'Disco não detectado').toUpperCase(),
  );
  readonly storageBadge = computed(() => this.snapshot().storage?.interfaceType ?? 'Disk');
  readonly storageStats = computed(() => {
    const storage = this.snapshot().storage;
    if (!storage) {
      return [
        { label: 'USADO', value: '—' },
        { label: 'LIVRE', value: '—' },
      ];
    }
    return [
      { label: 'USADO', value: `${formatGb(storage.usedGb)} GB` },
      { label: 'LIVRE', value: `${formatGb(storage.freeGb)} GB` },
    ];
  });
  readonly storageHealth = computed(() => {
    const status = this.snapshot().storage?.smartStatus;
    return status ? `Saúde SMART: ${status}` : 'Saúde SMART: —';
  });
  readonly storageTemp = computed(() => formatTemp(this.snapshot().storage?.temperatureC));

  readonly games = [
    {
      title: 'Cyberpunk 2077',
      version: 'v2.12',
      tag: 'Ray Tracing Overdrive',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuASN3JMVwRi_XwnWvPMX3LEouOr0aeExdMqOllI03W8nOn9487rwJBPUFCnojvK2CVDGM25a9-ROGMOa_V1BFyJrgqWZy_o2SWli5KQte7nRE1Ynvd6L1GMGKpCMnRViy_J1duHSiDPnMFiSoiED3kwWqlmIZ_A_ezec_w5rLjhsNksDEZdjNirl4jNO9eyBVyHt8B4ZAji5dT_WmbZko6mz9gVk3GD_tODwqj0-KJ4cMbGerZI7o40tg',
      leftValue: '118',
      rightLabel: '1% Low',
      rightValue: '94',
      rightUnit: 'FPS',
      metaLeft: 'DLSS Frame Gen: Ativo',
      metaRight: 'Ontem',
    },
    {
      title: 'Valorant',
      version: 'v8.08',
      tag: 'Competitivo eSports',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAuYt2BtNnIgT-1884Vkz_0_Xg18u92UYQIRU5uiss_RxyjFJSDO7nKqN1m2R2mgkO2jNKKgf2Jz1vPhrzTo4_vN3nxV1Z0xfummP6VkWuPFQNXO-45vu4fXtwb68xC6qqhCKOWrraG3PdOuZymfyC2wcB0wOlcSx3V3peXhcGaw260P4WMDv_m5vfmuXnatp8AQ3mqnJHR8eT9uUHy5J5iv8udXNyEg8kyvNuSjh78qULshb6wHiSoAA',
      leftValue: '540',
      rightLabel: 'Latência',
      rightValue: '4.2',
      rightUnit: 'ms',
      rightTone: 'success' as const,
      metaLeft: 'NVIDIA Reflex: Boost On',
      metaRight: 'Há 2h',
    },
    {
      title: 'Counter-Strike 2',
      version: 'Build 1398',
      tag: 'Source 2 Engine',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAz8RX8qPfKzTFuAnlxti-4Z9cSRQykUBfbVVQ3NrR1f3uEltk7EKv3k7H9IVpx1VsYqO72Ez2Mz_mgH5f30DU-gc-cJAacgJE8vaBkjttoSr8bwn-39OfdoxbJRHpPEjk3puZm31adJkrG7f00VxMcL89bF5tmVYbQduaeMqpsXhhhvyQTeXyBo1Dzu9YaB1EyOBB4BEfjkXkrshTboXZEaIppjhebl0UGySDhE-f98HEXLZ8au1ie2Q',
      leftValue: '390',
      rightLabel: 'Sub-Tick Jitter',
      rightValue: '0.8',
      rightUnit: 'ms',
      rightTone: 'success' as const,
      metaLeft: 'Autoexec: Carregado',
      metaRight: 'Hoje',
    },
  ];
}
