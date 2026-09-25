import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import { existsSync } from 'fs';
import { collectSystemSnapshot } from './system-info';
import {
  applyDisplayColor,
  listDisplayDevices,
  probeGammaRampApi,
  resetDisplayColor,
} from './display-color';
import type { DisplayColorSettings } from '../shared/display-color.model';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

function resolveIconPath(): string | undefined {
  const candidates = isDev
    ? [
        path.join(__dirname, '../../build/icon.ico'),
        path.join(__dirname, '../../build/icon.png'),
      ]
    : [
        path.join(process.resourcesPath, 'icon.ico'),
        path.join(process.resourcesPath, 'icon.png'),
      ];
  return candidates.find((candidate) => existsSync(candidate));
}

function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    backgroundColor: '#0b0d10',
    show: false,
    icon: resolveIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  if (isDev) {
    void mainWindow.loadURL('http://localhost:4444');
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../../dist/apex-suite/browser/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function setupAutoUpdater(win: BrowserWindow): void {
  if (isDev) return;

  autoUpdater.autoDownload = false;

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update:available', { version: info.version });
  });
  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('update:progress', { percent: Math.floor(progress.percent) });
  });
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update:downloaded');
  });
  autoUpdater.on('error', (err) => {
    win.webContents.send('update:error', err?.message ?? String(err));
  });
}

app.whenReady().then(() => {
  probeGammaRampApi();
  const win = createWindow();
  setupAutoUpdater(win);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const next = createWindow();
      setupAutoUpdater(next);
    }
  });
});

app.on('before-quit', () => {
  resetDisplayColor();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.close());

ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('system:getSnapshot', async () => collectSystemSnapshot());
ipcMain.handle('display:list', async () => listDisplayDevices());
ipcMain.handle('display:probeGamma', async () => probeGammaRampApi());
ipcMain.handle(
  'display:applyColor',
  async (_event, payload: { settings: DisplayColorSettings; displayId?: string | null }) =>
    applyDisplayColor(payload.settings, payload.displayId),
);
ipcMain.handle('display:resetColor', async (_event, displayId?: string | null) =>
  resetDisplayColor(displayId),
);

ipcMain.handle('update:check', () => autoUpdater.checkForUpdates());
ipcMain.handle('update:download', () => autoUpdater.downloadUpdate());
ipcMain.handle('update:install', () => {
  autoUpdater.quitAndInstall();
});
