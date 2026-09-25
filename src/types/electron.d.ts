import type { SystemSnapshot } from '../../shared/system-info.model';
import type { DisplayColorSettings, DisplayDeviceInfo } from '../../shared/display-color.model';

export type ColorApplyResult = { ok: boolean; message: string; api?: string };
export type ColorResetResult = ColorApplyResult & { settings: DisplayColorSettings };
export type GammaProbeResult = { ok: boolean; message: string; api: string };

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  getSystemSnapshot: () => Promise<SystemSnapshot>;
  listDisplays: () => Promise<DisplayDeviceInfo[]>;
  probeGammaRamp: () => Promise<GammaProbeResult>;
  applyDisplayColor: (
    settings: DisplayColorSettings,
    displayId?: string | null,
  ) => Promise<ColorApplyResult>;
  resetDisplayColor: (displayId?: string | null) => Promise<ColorResetResult>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
