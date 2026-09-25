import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  shell,
  Tray,
} from 'electron';
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
import {
  findPresetById,
  loadRecentProfileIds,
  pushRecentProfileId,
  resolveRecentProfiles,
} from './recent-profiles';
import {
  COLOR_PROFILE_PRESETS,
  DEFAULT_COLOR_SETTINGS,
  type DisplayColorSettings,
} from '../shared/display-color.model';

const PROFILE_ARG_PREFIX = '--apex-profile=';
const QUIT_ARG = '--apex-quit';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

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

function parseProfileArg(argv: string[]): string | null {
  const hit = argv.find((arg) => arg.startsWith(PROFILE_ARG_PREFIX));
  if (!hit) return null;
  return hit.slice(PROFILE_ARG_PREFIX.length).trim() || null;
}

function wantsQuit(argv: string[]): boolean {
  return argv.includes(QUIT_ARG);
}

function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  }
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function hideToTaskbar(): void {
  mainWindow?.minimize();
}

function applyColorPreset(profileId: string): boolean {
  const preset = findPresetById(profileId);
  if (!preset) return false;

  const settings: DisplayColorSettings = {
    ...DEFAULT_COLOR_SETTINGS,
    ...preset.settings,
    profileId: preset.id,
  };

  const result = applyDisplayColor(settings);
  pushRecentProfileId(preset.id);
  refreshWindowsShortcuts();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('profile:apply', {
      profileId: preset.id,
      settings,
      ok: result.ok,
      message: result.message,
    });
  }

  return result.ok;
}

function profileLaunchArgs(profileId: string): string {
  const flag = `${PROFILE_ARG_PREFIX}${profileId}`;
  return isDev ? `. ${flag}` : flag;
}

function quitLaunchArgs(): string {
  return isDev ? `. ${QUIT_ARG}` : QUIT_ARG;
}

function refreshWindowsShortcuts(): void {
  if (process.platform !== 'win32') return;

  const recent = resolveRecentProfiles();
  const icon = resolveIconPath() ?? process.execPath;

  app.setJumpList([
    {
      type: 'custom',
      name: 'Perfis de cores recentes',
      items: recent.map((entry) => ({
        type: 'task' as const,
        title: entry.title,
        description: `Aplicar ${entry.title}`,
        program: process.execPath,
        args: profileLaunchArgs(entry.id),
        iconPath: icon,
        iconIndex: 0,
      })),
    },
    {
      type: 'tasks',
      items: [
        {
          type: 'task',
          title: 'Abrir Apex Suite',
          description: 'Mostrar a janela principal',
          program: process.execPath,
          args: isDev ? '.' : '',
          iconPath: icon,
          iconIndex: 0,
        },
        { type: 'separator' },
        {
          type: 'task',
          title: 'Sair',
          description: 'Encerrar Apex Suite',
          program: process.execPath,
          args: quitLaunchArgs(),
          iconPath: icon,
          iconIndex: 0,
        },
      ],
    },
  ]);

  rebuildTrayMenu();
}

function rebuildTrayMenu(): void {
  if (!tray) return;

  const recent = resolveRecentProfiles();
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Abrir Apex Suite', click: () => showMainWindow() },
      { type: 'separator' },
      { label: 'Perfis recentes', enabled: false },
      ...recent.map((entry) => ({
        label: entry.title,
        click: () => applyColorPreset(entry.id),
      })),
      { type: 'separator' },
      {
        label: 'Sair',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]),
  );
}

function createTray(): void {
  if (tray) return;
  const iconPath = resolveIconPath();
  const image = iconPath
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();

  tray = new Tray(
    image.isEmpty()
      ? nativeImage.createFromDataURL(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAHElEQVQokWNgGAWjYBSMglEwCkbBKBgFo4D6AQACHwABnQx3WwAAAABJRU5ErkJggg==',
        )
      : image,
  );
  tray.setToolTip('Apex Suite');
  tray.on('double-click', () => showMainWindow());
  rebuildTrayMenu();
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

  mainWindow.on('close', (event) => {
    if (isQuitting) return;
    event.preventDefault();
    hideToTaskbar();
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

function handleLaunchArgs(argv: string[]): void {
  if (wantsQuit(argv)) {
    isQuitting = true;
    app.quit();
    return;
  }

  const profileId = parseProfileArg(argv);
  if (profileId) applyColorPreset(profileId);
}

if (gotLock) {
  app.on('second-instance', (_event, argv) => {
    if (wantsQuit(argv)) {
      isQuitting = true;
      app.quit();
      return;
    }

    const profileId = parseProfileArg(argv);
    if (profileId) {
      applyColorPreset(profileId);
      return;
    }

    showMainWindow();
  });

  app.whenReady().then(() => {
    probeGammaRampApi();
    createTray();
    refreshWindowsShortcuts();

    const win = createWindow();
    setupAutoUpdater(win);
    handleLaunchArgs(process.argv);

    app.on('activate', () => {
      if (!mainWindow || mainWindow.isDestroyed()) {
        const next = createWindow();
        setupAutoUpdater(next);
      } else {
        showMainWindow();
      }
    });
  });

  app.on('before-quit', () => {
    isQuitting = true;
    resetDisplayColor();
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });

  // Mantém o processo vivo na barra de tarefas / tray
  app.on('window-all-closed', () => {
    // no-op on purpose
  });

  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('window:close', () => hideToTaskbar());
  ipcMain.on('window:quit', () => {
    isQuitting = true;
    app.quit();
  });

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

  ipcMain.handle('profiles:listRecent', () => resolveRecentProfiles(loadRecentProfileIds()));
  ipcMain.handle('profiles:recordRecent', (_event, profileId: string) => {
    const ids = pushRecentProfileId(profileId);
    refreshWindowsShortcuts();
    return resolveRecentProfiles(ids);
  });
  ipcMain.handle('profiles:listAll', () =>
    COLOR_PROFILE_PRESETS.map((p) => ({ id: p.id, title: p.title })),
  );

  ipcMain.handle('update:check', () => autoUpdater.checkForUpdates());
  ipcMain.handle('update:download', () => autoUpdater.downloadUpdate());
  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall();
  });
}
