import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
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

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    backgroundColor: '#0b0d10',
    show: false,
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
}

app.whenReady().then(() => {
  probeGammaRampApi();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
