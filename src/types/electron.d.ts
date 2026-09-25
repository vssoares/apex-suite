import type { SystemSnapshot } from '../../shared/system-info.model';
import type { DisplayColorSettings, DisplayDeviceInfo } from '../../shared/display-color.model';

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
export type RecentProfileEntry = { id: string; title: string };

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  quit: () => void;
  getAppVersion: () => Promise<string>;
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
  checkForUpdate: () => Promise<unknown>;
  downloadUpdate: () => Promise<unknown>;
  installUpdate: () => Promise<void>;
  onUpdateAvailable: (cb: (payload: UpdateAvailablePayload) => void) => () => void;
  onUpdateProgress: (cb: (payload: UpdateProgressPayload) => void) => () => void;
  onUpdateDownloaded: (cb: () => void) => () => void;
  onUpdateError: (cb: (message: string) => void) => () => void;
  onProfileApply: (cb: (payload: ProfileApplyPayload) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
