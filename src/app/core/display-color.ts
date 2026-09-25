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
  private readonly activeGameIdSignal = signal<string | null>(null);
  private readonly activeGameTitleSignal = signal<string | null>(null);
  private readonly overrideActiveSignal = signal(false);

  private readonly presetsSignal = signal<ColorProfilePreset[]>([...COLOR_PROFILE_PRESETS]);
  private readonly profileMetaSignal = signal<Record<string, { builtin: boolean }>>({});

  readonly settings = this.settingsSignal.asReadonly();
  readonly displays = this.displaysSignal.asReadonly();
  readonly selectedDisplayId = this.selectedDisplayIdSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly applying = this.applyingSignal.asReadonly();
  readonly available = this.availableSignal.asReadonly();
  readonly activeGameId = this.activeGameIdSignal.asReadonly();
  readonly activeGameTitle = this.activeGameTitleSignal.asReadonly();
  readonly overrideActive = this.overrideActiveSignal.asReadonly();
  readonly presets = this.presetsSignal.asReadonly();

  readonly selectedDisplay = computed(() => {
    const list = this.displays();
    const id = this.selectedDisplayId();
    return list.find((d) => d.id === id) ?? list[0] ?? null;
  });

  readonly activePreset = computed(() => {
    const id = this.settings().profileId;
    return this.presetsSignal().find((p) => p.id === id) ?? null;
  });

  readonly isActiveProfileBuiltin = computed(() => {
    const id = this.settings().profileId;
    return this.profileMetaSignal()[id]?.builtin ?? true;
  });

  readonly activeProfileLabel = computed(() => {
    if (this.overrideActive() && this.activeGameTitle()) {
      return `Override ativo: ${this.activeGameTitle()}`;
    }
    const preset = this.activePreset();
    const display = this.selectedDisplay();
    const name = preset?.title ?? 'Personalizado';
    const displayName = display?.label ?? 'Display 1';
    return `Perfil: ${name} (${displayName})`;
  });

  private offProfile: (() => void) | null = null;
  private offGame: (() => void) | null = null;

  constructor() {
    void this.bootstrap();
    this.destroyRef.onDestroy(() => {
      if (this.applyTimer) {
        clearTimeout(this.applyTimer);
        this.applyTimer = null;
      }
      this.offProfile?.();
      this.offGame?.();
    });
  }

  private async bootstrap(): Promise<void> {
    this.listenExternalEvents();
    await Promise.all([this.loadDisplays(), this.reloadProfiles()]);
    await this.syncActiveState();
  }

  async reloadProfiles(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.listColorProfiles) {
      this.presetsSignal.set([...COLOR_PROFILE_PRESETS]);
      const meta: Record<string, { builtin: boolean }> = {};
      for (const p of COLOR_PROFILE_PRESETS) meta[p.id] = { builtin: true };
      this.profileMetaSignal.set(meta);
      return;
    }

    try {
      const list = await api.listColorProfiles();
      this.presetsSignal.set(
        list.map(({ builtin: _b, updatedAt: _u, ...profile }) => profile),
      );
      const meta: Record<string, { builtin: boolean }> = {};
      for (const p of list) meta[p.id] = { builtin: p.builtin };
      this.profileMetaSignal.set(meta);
    } catch {
      this.presetsSignal.set([...COLOR_PROFILE_PRESETS]);
    }
  }

  private listenExternalEvents(): void {
    const api = window.electronAPI;
    if (!api) return;

    if (api.onProfileApply) {
      this.offProfile = api.onProfileApply((payload) => {
        // Só sincroniza settings editáveis quando não há override de jogo
        if (!this.overrideActiveSignal()) {
          this.settingsSignal.set({ ...payload.settings });
        }
        this.statusSignal.set(payload.message);
      });
    }

    if (api.onGameColorActive) {
      this.offGame = api.onGameColorActive((payload) => {
        this.activeGameIdSignal.set(payload.gameId);
        this.activeGameTitleSignal.set(payload.title);
        this.overrideActiveSignal.set(payload.source === 'game');
        this.statusSignal.set(payload.message);
        if (payload.source === 'global') {
          this.settingsSignal.set({ ...payload.settings });
        }
      });
    }
  }

  private async syncActiveState(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.getActiveGameColor) return;
    try {
      const active = await api.getActiveGameColor();
      this.activeGameIdSignal.set(active.gameId);
      this.activeGameTitleSignal.set(active.title);
      this.overrideActiveSignal.set(active.overrideActive);
      if (active.source === 'global') {
        this.settingsSignal.set({ ...active.settings });
      }
    } catch {
      // ignore
    }
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
      const matched = this.presetsSignal().find((preset) => this.matchesPreset(next, preset));
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
      this.overrideActiveSignal.set(false);
      this.activeGameIdSignal.set(null);
      this.activeGameTitleSignal.set(null);
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

  async saveAsProfile(title: string, description?: string): Promise<void> {
    const api = window.electronAPI;
    if (!api?.createColorProfile) {
      this.statusSignal.set('Salvar perfil só funciona no Electron.');
      return;
    }

    try {
      const created = await api.createColorProfile({
        title,
        description,
        settings: this.settingsSignal(),
      });
      await this.reloadProfiles();
      this.settingsSignal.update((s) => ({ ...s, profileId: created.id }));
      void api.recordRecentProfile?.(created.id);
      this.statusSignal.set(`Perfil "${created.title}" salvo no computador.`);
      await this.flushApply();
    } catch (err) {
      this.statusSignal.set((err as Error)?.message || 'Falha ao salvar perfil.');
    }
  }

  async updateActiveProfile(): Promise<void> {
    const api = window.electronAPI;
    const id = this.settings().profileId;
    if (!api?.updateColorProfile || this.isActiveProfileBuiltin()) {
      this.statusSignal.set('Selecione um perfil personalizado para atualizar.');
      return;
    }

    try {
      await api.updateColorProfile({ id, settings: this.settingsSignal() });
      await this.reloadProfiles();
      this.statusSignal.set('Perfil atualizado no computador.');
      await this.flushApply();
    } catch (err) {
      this.statusSignal.set((err as Error)?.message || 'Falha ao atualizar perfil.');
    }
  }

  async deleteProfile(id: string): Promise<void> {
    const api = window.electronAPI;
    if (!api?.deleteColorProfile) return;
    if (this.profileMetaSignal()[id]?.builtin) {
      this.statusSignal.set('Perfis embutidos não podem ser excluídos.');
      return;
    }

    try {
      await api.deleteColorProfile(id);
      await this.reloadProfiles();
      if (this.settings().profileId === id) {
        this.settingsSignal.update((s) => ({ ...s, profileId: 'custom' }));
      }
      this.statusSignal.set('Perfil excluído.');
    } catch (err) {
      this.statusSignal.set((err as Error)?.message || 'Falha ao excluir perfil.');
    }
  }

  async exportProfiles(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.exportColorProfiles) return;
    try {
      const result = await api.exportColorProfiles();
      this.statusSignal.set(result.message);
    } catch {
      this.statusSignal.set('Falha ao exportar perfis.');
    }
  }

  async importProfiles(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.importColorProfiles) return;
    try {
      const result = await api.importColorProfiles();
      await this.reloadProfiles();
      this.statusSignal.set(result.message);
    } catch {
      this.statusSignal.set('Falha ao importar perfis.');
    }
  }

  isProfileBuiltin(id: string): boolean {
    return this.profileMetaSignal()[id]?.builtin ?? true;
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
