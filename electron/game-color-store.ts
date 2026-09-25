import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_COLOR_SETTINGS, type DisplayColorSettings } from '../shared/display-color.model';
import {
  defaultOverrideForGame,
  findGameById,
  KNOWN_GAMES,
  type GameColorOverride,
  type GameColorState,
} from '../shared/game-color.model';

const STORE_FILE = 'game-color-state.json';

function storePath(): string {
  return path.join(app.getPath('userData'), STORE_FILE);
}

function normalizeOverride(raw: Partial<GameColorOverride>): GameColorOverride | null {
  if (!raw.gameId || !findGameById(raw.gameId)) return null;
  const base = defaultOverrideForGame(findGameById(raw.gameId)!);
  return {
    gameId: raw.gameId,
    enabled: Boolean(raw.enabled),
    presetId: typeof raw.presetId === 'string' ? raw.presetId : base.presetId,
    settings: {
      ...DEFAULT_COLOR_SETTINGS,
      ...(raw.settings ?? base.settings),
      profileId: raw.settings?.profileId ?? base.settings.profileId,
    },
  };
}

export function loadGameColorState(): GameColorState {
  try {
    const raw = fs.readFileSync(storePath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<GameColorState>;
    const overrides = (parsed.overrides ?? [])
      .map((item) => normalizeOverride(item))
      .filter((item): item is GameColorOverride => item != null);

    return {
      globalSettings: {
        ...DEFAULT_COLOR_SETTINGS,
        ...(parsed.globalSettings ?? {}),
      },
      overrides,
    };
  } catch {
    return {
      globalSettings: { ...DEFAULT_COLOR_SETTINGS },
      overrides: [],
    };
  }
}

function saveGameColorState(state: GameColorState): void {
  try {
    fs.mkdirSync(path.dirname(storePath()), { recursive: true });
    fs.writeFileSync(storePath(), JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // ignore
  }
}

export function getGlobalColorSettings(): DisplayColorSettings {
  return { ...loadGameColorState().globalSettings };
}

export function saveGlobalColorSettings(settings: DisplayColorSettings): DisplayColorSettings {
  const state = loadGameColorState();
  state.globalSettings = { ...settings };
  saveGameColorState(state);
  return state.globalSettings;
}

export function listGameOverrides(): GameColorOverride[] {
  const state = loadGameColorState();
  return KNOWN_GAMES.map((game) => {
    const existing = state.overrides.find((o) => o.gameId === game.id);
    return existing ?? defaultOverrideForGame(game);
  });
}

export function getGameOverride(gameId: string): GameColorOverride | null {
  const game = findGameById(gameId);
  if (!game) return null;
  const state = loadGameColorState();
  return state.overrides.find((o) => o.gameId === gameId) ?? defaultOverrideForGame(game);
}

export function upsertGameOverride(
  patch: Partial<GameColorOverride> & { gameId: string },
): GameColorOverride {
  const current = getGameOverride(patch.gameId);
  if (!current) {
    throw new Error(`Jogo desconhecido: ${patch.gameId}`);
  }

  const next: GameColorOverride = {
    ...current,
    ...patch,
    settings: {
      ...current.settings,
      ...(patch.settings ?? {}),
    },
  };

  const state = loadGameColorState();
  const index = state.overrides.findIndex((o) => o.gameId === next.gameId);
  if (index >= 0) state.overrides[index] = next;
  else state.overrides.push(next);
  saveGameColorState(state);
  return next;
}

export function getEnabledOverrideForGame(gameId: string): GameColorOverride | null {
  const override = getGameOverride(gameId);
  if (!override?.enabled) return null;
  return override;
}
