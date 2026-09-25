import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Icon } from '../../shared/ui/icon/icon';
import { Panel } from '../../shared/ui/panel/panel';
import { Toggle } from '../../shared/ui/toggle/toggle';
import { Badge } from '../../shared/ui/badge/badge';
import { StatusDot } from '../../shared/ui/status-dot/status-dot';
import { DisplayColor } from '../../core/display-color';
import { COLOR_PROFILE_PRESETS } from '../../core/display-color.model';
import type { GameColorOverride, GameDefinition } from '../../core/game-color.model';

type GameListItem = GameDefinition & {
  override: GameColorOverride | null;
  running: boolean;
};

type ColorPresetOption = { id: string; title: string; code: string };

@Component({
  selector: 'app-game-profiles-page',
  imports: [Icon, Panel, Toggle, Badge, StatusDot],
  templateUrl: './game-profiles.html',
  styleUrl: './game-profiles.scss',
})
export class GameProfilesPage {
  private readonly displayColor = inject(DisplayColor);
  private readonly destroyRef = inject(DestroyRef);

  readonly games = signal<GameListItem[]>([]);
  readonly presets = signal<ColorPresetOption[]>(
    COLOR_PROFILE_PRESETS.map((p) => ({ id: p.id, title: p.title, code: p.code })),
  );
  readonly loading = signal(true);
  readonly status = signal('');
  readonly activeGameTitle = this.displayColor.activeGameTitle;
  readonly overrideActive = this.displayColor.overrideActive;

  readonly runningCount = computed(() => this.games().filter((g) => g.running).length);
  readonly enabledCount = computed(
    () => this.games().filter((g) => g.override?.enabled).length,
  );

  constructor() {
    void this.reload();
    const api = window.electronAPI;
    if (api?.onGameColorActive) {
      const off = api.onGameColorActive(() => {
        void this.reload(false);
      });
      this.destroyRef.onDestroy(() => off());
    }
  }

  private async reload(showLoading = true): Promise<void> {
    const api = window.electronAPI;
    if (showLoading) this.loading.set(true);

    if (!api?.listGames) {
      this.games.set([]);
      this.loading.set(false);
      this.status.set('Abra no Electron para configurar overrides por jogo.');
      return;
    }

    try {
      const [games, presets] = await Promise.all([
        api.listGames(),
        api.listColorPresets?.() ?? Promise.resolve(this.presets()),
      ]);
      this.games.set(games);
      if (presets.length) this.presets.set(presets);
    } catch {
      this.status.set('Falha ao carregar perfis de jogos.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async onToggle(game: GameListItem, enabled: boolean): Promise<void> {
    const api = window.electronAPI;
    if (!api?.upsertGameOverride) return;

    try {
      await api.upsertGameOverride({
        gameId: game.id,
        enabled,
        presetId: game.override?.presetId ?? game.defaultPresetId,
        settings: game.override?.settings,
      });
      this.status.set(
        enabled
          ? `Override ativo para ${game.title} — sobrescreve as cores gerais ao detectar o jogo.`
          : `Override desativado para ${game.title}.`,
      );
      await this.reload(false);
    } catch {
      this.status.set(`Falha ao atualizar ${game.title}.`);
    }
  }

  protected async onPresetChange(game: GameListItem, event: Event): Promise<void> {
    const presetId = (event.target as HTMLSelectElement).value;
    const api = window.electronAPI;
    if (!api?.applyGamePreset) return;

    try {
      await api.applyGamePreset({
        gameId: game.id,
        presetId,
        enabled: game.override?.enabled ?? true,
      });
      this.status.set(`Preset de cor aplicado ao perfil de ${game.title}.`);
      await this.reload(false);
    } catch {
      this.status.set(`Falha ao aplicar preset em ${game.title}.`);
    }
  }
}
