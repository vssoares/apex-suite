import type {
  ColorProfilePreset,
  DisplayColorSettings,
  DisplayDeviceInfo,
} from '../../shared/display-color.model';
import type { SystemSnapshot } from '../../shared/system-info.model';
import type {
  ActiveGameColorPayload,
  GameColorOverride,
  GameDefinition,
} from '../../shared/game-color.model';

export type ColorApplyResult = { ok: boolean; message: string; api?: string };
export type ColorResetResult = ColorApplyResult & { settings: DisplayColorSettings };
export type GammaProbeResult = { ok: boolean; message: string; api: string };
export type UpdateAvailablePayload = { version: string };
export type UpdateProgressPayload = { percent: number };
export type ProfileApplyPayload = {
  profileId: string;
  settings: DisplayColorSettings;
  ok: boolean;
  message: string;
};
export type RecentProfileEntry = { id: string; title: string; shortTitle?: string };
export type GameListItem = GameDefinition & {
  override: GameColorOverride | null;
  running: boolean;
};
export type ColorPresetOption = {
  id: string;
  title: string;
  code: string;
  builtin?: boolean;
};
export type StoredColorProfile = ColorProfilePreset & {
  builtin: boolean;
  updatedAt: number;
};

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  quit: () => void;
  getAppVersion: () => Promise<string>;
  getOpenAtLogin: () => Promise<boolean>;
  setOpenAtLogin: (enabled: boolean) => Promise<boolean>;
  getSystemSnapshot: () => Promise<SystemSnapshot>;
  listDisplays: () => Promise<DisplayDeviceInfo[]>;
  probeGammaRamp: () => Promise<GammaProbeResult>;
  applyDisplayColor: (
    settings: DisplayColorSettings,
    displayId?: string | null,
  ) => Promise<ColorApplyResult>;
  resetDisplayColor: (displayId?: string | null) => Promise<ColorResetResult>;
  listRecentProfiles: () => Promise<RecentProfileEntry[]>;
  recordRecentProfile: (profileId: string) => Promise<RecentProfileEntry[]>;
  listColorProfiles: () => Promise<StoredColorProfile[]>;
  createColorProfile: (input: {
    title: string;
    description?: string;
    settings: DisplayColorSettings;
    icon?: string;
  }) => Promise<StoredColorProfile>;
  updateColorProfile: (payload: {
    id: string;
    title?: string;
    description?: string;
    settings?: DisplayColorSettings;
    icon?: string;
  }) => Promise<StoredColorProfile>;
  deleteColorProfile: (id: string) => Promise<{ ok: boolean }>;
  exportColorProfiles: (
    ids?: string[] | null,
  ) => Promise<{ ok: boolean; path?: string; message: string }>;
  importColorProfiles: () => Promise<{ ok: boolean; imported: number; message: string }>;
  listGames: () => Promise<GameListItem[]>;
  listGameOverrides: () => Promise<GameColorOverride[]>;
  upsertGameOverride: (
    patch: Partial<GameColorOverride> & { gameId: string },
  ) => Promise<GameColorOverride>;
  applyGamePreset: (payload: {
    gameId: string;
    presetId: string;
    enabled?: boolean;
  }) => Promise<GameColorOverride>;
  getActiveGameColor: () => Promise<{
    gameId: string | null;
    title: string | null;
    overrideActive: boolean;
    settings: DisplayColorSettings;
    source: 'global' | 'game';
  }>;
  listColorPresets: () => Promise<ColorPresetOption[]>;
  checkForUpdate: () => Promise<unknown>;
  downloadUpdate: () => Promise<unknown>;
  installUpdate: () => Promise<void>;
  onUpdateAvailable: (cb: (payload: UpdateAvailablePayload) => void) => () => void;
  onUpdateProgress: (cb: (payload: UpdateProgressPayload) => void) => () => void;
  onUpdateDownloaded: (cb: () => void) => () => void;
  onUpdateError: (cb: (message: string) => void) => () => void;
  onProfileApply: (cb: (payload: ProfileApplyPayload) => void) => () => void;
  onGameColorActive: (cb: (payload: ActiveGameColorPayload) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
