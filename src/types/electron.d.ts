import type { SystemSnapshot } from '../../shared/system-info.model';
import type { DisplayColorSettings, DisplayDeviceInfo } from '../../shared/display-color.model';

export type ColorApplyResult = { ok: boolean; message: string; api?: string };
export type ColorResetResult = ColorApplyResult & { settings: DisplayColorSettings };
export type GammaProbeResult = { ok: boolean; message: string; api: string };
export type UpdateAvailablePayload = { version: string };
export type UpdateProgressPayload = { percent: number };

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  getAppVersion: () => Promise<string>;
  getSystemSnapshot: () => Promise<SystemSnapshot>;
  listDisplays: () => Promise<DisplayDeviceInfo[]>;
  probeGammaRamp: () => Promise<GammaProbeResult>;
  applyDisplayColor: (
    settings: DisplayColorSettings,
    displayId?: string | null,
  ) => Promise<ColorApplyResult>;
  resetDisplayColor: (displayId?: string | null) => Promise<ColorResetResult>;
  checkForUpdate: () => Promise<unknown>;
  downloadUpdate: () => Promise<unknown>;
  installUpdate: () => Promise<void>;
  onUpdateAvailable: (cb: (payload: UpdateAvailablePayload) => void) => () => void;
  onUpdateProgress: (cb: (payload: UpdateProgressPayload) => void) => () => void;
  onUpdateDownloaded: (cb: () => void) => () => void;
  onUpdateError: (cb: (message: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
