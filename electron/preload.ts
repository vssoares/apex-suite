import { contextBridge, ipcRenderer } from 'electron';
import type { SystemSnapshot } from '../shared/system-info.model';
import type { DisplayColorSettings, DisplayDeviceInfo } from '../shared/display-color.model';

export type ColorApplyResult = { ok: boolean; message: string; api?: string };
export type ColorResetResult = ColorApplyResult & { settings: DisplayColorSettings };
export type GammaProbeResult = { ok: boolean; message: string; api: string };

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
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
});
