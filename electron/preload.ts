import { contextBridge, ipcRenderer } from 'electron';
import type { SystemSnapshot } from '../shared/system-info.model';

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  getSystemSnapshot: (): Promise<SystemSnapshot> => ipcRenderer.invoke('system:getSnapshot'),
});
