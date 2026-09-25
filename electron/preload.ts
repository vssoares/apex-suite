import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { SystemSnapshot } from '../shared/system-info.model';
import type { DisplayColorSettings, DisplayDeviceInfo } from '../shared/display-color.model';

export type ColorApplyResult = { ok: boolean; message: string; api?: string };
export type ColorResetResult = ColorApplyResult & { settings: DisplayColorSettings };
export type GammaProbeResult = { ok: boolean; message: string; api: string };
export type UpdateAvailablePayload = { version: string };
export type UpdateProgressPayload = { percent: number };

function subscribe<T>(channel: string, callback: (payload: T) => void): () => void {
  const listener = (_event: IpcRendererEvent, payload: T) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
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
  checkForUpdate: (): Promise<unknown> => ipcRenderer.invoke('update:check'),
  downloadUpdate: (): Promise<unknown> => ipcRenderer.invoke('update:download'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('update:install'),
  onUpdateAvailable: (cb: (payload: UpdateAvailablePayload) => void) =>
    subscribe('update:available', cb),
  onUpdateProgress: (cb: (payload: UpdateProgressPayload) => void) =>
    subscribe('update:progress', cb),
  onUpdateDownloaded: (cb: () => void) => subscribe('update:downloaded', cb),
  onUpdateError: (cb: (message: string) => void) => subscribe('update:error', cb),
});
