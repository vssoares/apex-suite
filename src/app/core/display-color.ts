import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  COLOR_FIELD_DEFAULTS,
  COLOR_PROFILE_PRESETS,
  DEFAULT_COLOR_SETTINGS,
  type ColorField,
  type ColorProfilePreset,
  type DisplayColorSettings,
  type DisplayDeviceInfo,
} from './display-color.model';

const APPLY_DEBOUNCE_MS = 90;

@Service()
export class DisplayColor {
  private readonly destroyRef = inject(DestroyRef);
  private applyTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly settingsSignal = signal<DisplayColorSettings>({ ...DEFAULT_COLOR_SETTINGS });
  private readonly displaysSignal = signal<DisplayDeviceInfo[]>([]);
  private readonly selectedDisplayIdSignal = signal('0');
  private readonly statusSignal = signal('Aguardando ajuste…');
  private readonly applyingSignal = signal(false);
  private readonly availableSignal = signal(false);

  readonly settings = this.settingsSignal.asReadonly();
  readonly displays = this.displaysSignal.asReadonly();
  readonly selectedDisplayId = this.selectedDisplayIdSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly applying = this.applyingSignal.asReadonly();
  readonly available = this.availableSignal.asReadonly();
  readonly presets = COLOR_PROFILE_PRESETS;

  readonly selectedDisplay = computed(() => {
    const list = this.displays();
    const id = this.selectedDisplayId();
    return list.find((d) => d.id === id) ?? list[0] ?? null;
  });

  readonly activePreset = computed(() => {
    const id = this.settings().profileId;
    return this.presets.find((p) => p.id === id) ?? null;
  });

  readonly activeProfileLabel = computed(() => {
    const preset = this.activePreset();
    const display = this.selectedDisplay();
    const name = preset?.title ?? 'Personalizado';
    const displayName = display?.label ?? 'Display 1';
    return `Perfil: ${name} (${displayName})`;
  });

  private externalProfileOff: (() => void) | null = null;

  constructor() {
    void this.loadDisplays();
    this.listenExternalProfileApply();
    this.destroyRef.onDestroy(() => {
      if (this.applyTimer) {
        clearTimeout(this.applyTimer);
        this.applyTimer = null;
      }
      this.externalProfileOff?.();
    });
  }

  private listenExternalProfileApply(): void {
    const api = window.electronAPI;
    if (!api?.onProfileApply) return;
    this.externalProfileOff = api.onProfileApply((payload) => {
      this.settingsSignal.set({ ...payload.settings });
      this.statusSignal.set(payload.message);
    });
  }

  async loadDisplays(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.listDisplays) {
      this.availableSignal.set(false);
      this.displaysSignal.set([
        {
          id: '0',
          label: 'DISPLAY 01 [PRIMÁRIO]',
          model: 'Display do Sistema',
          connection: 'Browser Preview',
          resolution: '—',
          refreshRate: null,
          primary: true,
          sizeInch: null,
        },
      ]);
      this.selectedDisplayIdSignal.set('0');
      this.statusSignal.set('Preview no browser — abra no Electron para usar a Windows Gamma Ramp API.');
      return;
    }

    try {
      const list = await api.listDisplays();
      this.displaysSignal.set(list);
      const primary = list.find((d) => d.primary) ?? list[0];
      if (primary) this.selectedDisplayIdSignal.set(primary.id);

      const probe = api.probeGammaRamp ? await api.probeGammaRamp() : null;
      this.availableSignal.set(probe?.ok ?? true);
      this.statusSignal.set(
        probe?.message ?? 'Windows Gamma Ramp API (SetDeviceGammaRamp) pronta.',
      );
    } catch {
      this.availableSignal.set(false);
      this.statusSignal.set('Falha ao inicializar Windows Gamma Ramp API.');
    }
  }

  selectDisplay(id: string): void {
    this.selectedDisplayIdSignal.set(id);
  }

  setField(field: ColorField, value: number): void {
    this.settingsSignal.update((current) => {
      const next: DisplayColorSettings = {
        ...current,
        [field]: value,
        profileId: 'custom',
      };
      const matched = this.presets.find((preset) => this.matchesPreset(next, preset));
      if (matched) next.profileId = matched.id;
      return next;
    });
    this.scheduleApply();
  }

  applyPreset(preset: ColorProfilePreset): void {
    this.settingsSignal.set({
      ...DEFAULT_COLOR_SETTINGS,
      ...preset.settings,
      profileId: preset.id,
    });
    void window.electronAPI?.recordRecentProfile?.(preset.id);
    this.scheduleApply(true);
  }

  resetField(field: ColorField): void {
    this.setField(field, COLOR_FIELD_DEFAULTS[field]);
  }

  async resetToWindows(): Promise<void> {
    const api = window.electronAPI;
    this.settingsSignal.set({ ...DEFAULT_COLOR_SETTINGS });

    if (!api?.resetDisplayColor) {
      this.statusSignal.set('Padrões locais restaurados (sem Electron).');
      return;
    }

    this.applyingSignal.set(true);
    try {
      const result = await api.resetDisplayColor(this.selectedDisplayIdSignal());
      this.settingsSignal.set({ ...result.settings });
      this.statusSignal.set(result.message);
    } catch {
      this.statusSignal.set('Erro ao restaurar via SetDeviceGammaRamp.');
    } finally {
      this.applyingSignal.set(false);
    }
  }

  async applyNow(): Promise<void> {
    if (this.applyTimer) {
      clearTimeout(this.applyTimer);
      this.applyTimer = null;
    }
    await this.flushApply();
  }

  private matchesPreset(settings: DisplayColorSettings, preset: ColorProfilePreset): boolean {
    return Object.entries(preset.settings).every(([key, expected]) => {
      const current = settings[key as ColorField];
      return typeof expected === 'number' ? current === expected : true;
    });
  }

  private scheduleApply(immediate = false): void {
    if (this.applyTimer) {
      clearTimeout(this.applyTimer);
      this.applyTimer = null;
    }
    if (immediate) {
      void this.flushApply();
      return;
    }
    this.applyTimer = setTimeout(() => {
      this.applyTimer = null;
      void this.flushApply();
    }, APPLY_DEBOUNCE_MS);
  }

  private async flushApply(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.applyDisplayColor) {
      this.statusSignal.set('Ajuste local (Electron + SetDeviceGammaRamp necessário).');
      return;
    }

    this.applyingSignal.set(true);
    try {
      const result = await api.applyDisplayColor(
        this.settingsSignal(),
        this.selectedDisplayIdSignal(),
      );
      this.statusSignal.set(result.message);
      if (result.ok) this.availableSignal.set(true);
    } catch {
      this.statusSignal.set('Erro ao chamar SetDeviceGammaRamp.');
    } finally {
      this.applyingSignal.set(false);
    }
  }
}