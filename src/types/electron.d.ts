import type { SystemSnapshot } from '../../shared/system-info.model';

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  getSystemSnapshot: () => Promise<SystemSnapshot>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
