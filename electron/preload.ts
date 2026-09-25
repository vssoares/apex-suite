import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type {
  ColorProfilePreset,
  DisplayColorSettings,
  DisplayDeviceInfo,
} from '../shared/display-color.model';
import type { SystemSnapshot } from '../shared/system-info.model';
import type {
  ActiveGameColorPayload,
  GameColorOverride,
  GameDefinition,
} from '../shared/game-color.model';

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

function subscribe<T>(channel: string, callback: (payload: T) => void): () => void {
  const listener = (_event: IpcRendererEvent, payload: T) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  quit: () => ipcRenderer.send('window:quit'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
  getOpenAtLogin: (): Promise<boolean> => ipcRenderer.invoke('app:getOpenAtLogin'),
  setOpenAtLogin: (enabled: boolean): Promise<boolean> =>
    ipcRenderer.invoke('app:setOpenAtLogin', enabled),
  getSystemSnapshot: (): Promise<SystemSnapshot> => ipcRenderer.invoke('system:getSnapshot'),
  listDisplays: (): Promise<DisplayDeviceInfo[]> => ipcRenderer.invoke('display:list'),
  probeGammaRamp: (): Promise<GammaProbeResult> => ipcRenderer.invoke('display:probeGamma'),
  applyDisplayColor: (
    settings: DisplayColorSettings,
    displayId?: string | null,
  ): Promise<ColorApplyResult> =>
    ipcRenderer.invoke('display:applyColor', { settings, displayId }),
  resetDisplayColor: (displayId?: string | null): Promise<ColorResetResult> =>
    ipcRenderer.invoke('display:resetColor', displayId),
  listRecentProfiles: (): Promise<RecentProfileEntry[]> =>
    ipcRenderer.invoke('profiles:listRecent'),
  recordRecentProfile: (profileId: string): Promise<RecentProfileEntry[]> =>
    ipcRenderer.invoke('profiles:recordRecent', profileId),
  listColorProfiles: (): Promise<StoredColorProfile[]> => ipcRenderer.invoke('profiles:list'),
  createColorProfile: (input: {
    title: string;
    description?: string;
    settings: DisplayColorSettings;
    icon?: string;
  }): Promise<StoredColorProfile> => ipcRenderer.invoke('profiles:create', input),
  updateColorProfile: (payload: {
    id: string;
    title?: string;
    description?: string;
    settings?: DisplayColorSettings;
    icon?: string;
  }): Promise<StoredColorProfile> => ipcRenderer.invoke('profiles:update', payload),
  deleteColorProfile: (id: string): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke('profiles:delete', id),
  exportColorProfiles: (
    ids?: string[] | null,
  ): Promise<{ ok: boolean; path?: string; message: string }> =>
    ipcRenderer.invoke('profiles:export', ids),
  importColorProfiles: (): Promise<{ ok: boolean; imported: number; message: string }> =>
    ipcRenderer.invoke('profiles:import'),
  listGames: (): Promise<GameListItem[]> => ipcRenderer.invoke('games:list'),
  listGameOverrides: (): Promise<GameColorOverride[]> =>
    ipcRenderer.invoke('games:listOverrides'),
  upsertGameOverride: (
    patch: Partial<GameColorOverride> & { gameId: string },
  ): Promise<GameColorOverride> => ipcRenderer.invoke('games:upsertOverride', patch),
  applyGamePreset: (payload: {
    gameId: string;
    presetId: string;
    enabled?: boolean;
  }): Promise<GameColorOverride> => ipcRenderer.invoke('games:applyPreset', payload),
  getActiveGameColor: () => ipcRenderer.invoke('games:getActive'),
  listColorPresets: (): Promise<ColorPresetOption[]> => ipcRenderer.invoke('games:listPresets'),
  checkForUpdate: (): Promise<unknown> => ipcRenderer.invoke('update:check'),
  downloadUpdate: (): Promise<unknown> => ipcRenderer.invoke('update:download'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('update:install'),
  onUpdateAvailable: (cb: (payload: UpdateAvailablePayload) => void) =>
    subscribe('update:available', cb),
  onUpdateProgress: (cb: (payload: UpdateProgressPayload) => void) =>
    subscribe('update:progress', cb),
  onUpdateDownloaded: (cb: () => void) => subscribe('update:downloaded', cb),
  onUpdateError: (cb: (message: string) => void) => subscribe('update:error', cb),
  onProfileApply: (cb: (payload: ProfileApplyPayload) => void) =>
    subscribe('profile:apply', cb),
  onGameColorActive: (cb: (payload: ActiveGameColorPayload) => void) =>
    subscribe('game-color:active', cb),
});
