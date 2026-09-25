import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  shell,
  Tray,
  type NativeImage,
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
  getEnabledOverrideForGame,
  getGameOverride,
  getGlobalColorSettings,
  listGameOverrides,
  saveGlobalColorSettings,
  upsertGameOverride,
} from './game-color-store';
import { getActiveGameId, startGameDetector, stopGameDetector } from './game-detector';
import {
  createColorProfile,
  deleteColorProfile,
  exportColorProfiles,
  findColorProfile,
  importColorProfiles,
  listColorProfiles,
  settingsFromProfileId,
  updateColorProfile,
} from './color-profiles-store';
import {
  findGameById,
  KNOWN_GAMES,
  type ActiveGameColorPayload,
  type GameColorOverride,
  type GameDefinition,
} from '../shared/game-color.model';
import { DEFAULT_COLOR_SETTINGS, type DisplayColorSettings } from '../shared/display-color.model';

const APP_USER_MODEL_ID = 'com.apexsuite.app';
const PROFILE_ARG_PREFIX = '--apex-profile=';
const QUIT_ARG = '--apex-quit';
const HIDDEN_ARG = '--apex-hidden';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Necessário no Windows para Jump List da barra de tarefas funcionar
if (process.platform === 'win32') {
  app.setAppUserModelId(APP_USER_MODEL_ID);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

function resolveIconPath(): string | undefined {
  const candidates = isDev
    ? [
        path.join(__dirname, '../../build/icon.ico'),
        path.join(__dirname, '../../build/icon.png'),
        path.join(__dirname, '../../public/logo.png'),
      ]
    : [
        path.join(process.resourcesPath, 'icon.ico'),
        path.join(process.resourcesPath, 'icon.png'),
      ];
  return candidates.find((candidate) => existsSync(candidate));
}

function createTrayImage(): NativeImage {
  const iconPath = resolveIconPath();
  let image = iconPath
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();

  if (!image.isEmpty()) {
    // Windows tray icons look best at 16–32px
    const size = process.platform === 'win32' ? 16 : 22;
    image = image.resize({ width: size, height: size, quality: 'best' });
  } else {
    image = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAHElEQVQokWNgGAWjYBSMglEwCkbBKBgFo4D6AQACHwABnQx3WwAAAABJRU5ErkJggg==',
    );
  }
  return image;
}

function getOpenAtLogin(): boolean {
  return app.getLoginItemSettings().openAtLogin;
}

function setOpenAtLogin(enabled: boolean): boolean {
  if (enabled) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
      args: isDev
        ? [path.resolve(__dirname, '../..'), HIDDEN_ARG]
        : [HIDDEN_ARG],
    });
  } else {
    app.setLoginItemSettings({ openAtLogin: false });
  }
  return getOpenAtLogin();
}

function wantsStartHidden(argv: string[]): boolean {
  return argv.includes(HIDDEN_ARG);
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
  mainWindow.setSkipTaskbar(false);
  mainWindow.show();
  mainWindow.focus();
}

/** Some da barra de tarefas e fica só no ícone da bandeja (área à direita). */
function hideToTray(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setSkipTaskbar(true);
  mainWindow.hide();
}

function notifyProfile(title: string, ok: boolean, message: string): void {
  if (!Notification.isSupported()) return;
  new Notification({
    title: ok ? `Perfil: ${title}` : 'Falha ao aplicar perfil',
    body: ok ? 'Curva de cor aplicada no display.' : message,
    icon: resolveIconPath(),
  }).show();
}

function broadcastActiveColor(payload: ActiveGameColorPayload): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('game-color:active', payload);
    mainWindow.webContents.send('profile:apply', {
      profileId: payload.settings.profileId,
      settings: payload.settings,
      ok: true,
      message: payload.message,
    });
  }
}

function reapplyEffectiveColor(opts?: { notify?: boolean }): ActiveGameColorPayload {
  const activeId = getActiveGameId();
  const override = activeId ? getEnabledOverrideForGame(activeId) : null;

  if (activeId && override) {
    const game = findGameById(activeId);
    const result = applyDisplayColor(override.settings);
    const payload: ActiveGameColorPayload = {
      gameId: activeId,
      title: game?.title ?? activeId,
      settings: override.settings,
      source: 'game',
      message: result.ok
        ? `Override de cor ativo: ${game?.title ?? activeId}`
        : result.message,
    };
    broadcastActiveColor(payload);
    if (opts?.notify) {
      notifyProfile(game?.title ?? 'Jogo', result.ok, payload.message);
    }
    return payload;
  }

  const global = getGlobalColorSettings();
  const result = applyDisplayColor(global);
  const payload: ActiveGameColorPayload = {
    gameId: null,
    title: null,
    settings: global,
    source: 'global',
    message: result.ok
      ? 'Cores gerais restauradas.'
      : result.message,
  };
  broadcastActiveColor(payload);
  return payload;
}

function onActiveGameChanged(game: GameDefinition | null): void {
  if (game) {
    const override = getEnabledOverrideForGame(game.id);
    if (override) {
      reapplyEffectiveColor({ notify: true });
      return;
    }
  }
  reapplyEffectiveColor({ notify: !!game });
}

function applyColorPreset(profileId: string, opts?: { notify?: boolean }): boolean {
  const preset = findPresetById(profileId);
  if (!preset) return false;

  const settings: DisplayColorSettings = {
    ...DEFAULT_COLOR_SETTINGS,
    ...preset.settings,
    profileId: preset.id,
  };

  saveGlobalColorSettings(settings);
  pushRecentProfileId(preset.id);
  refreshWindowsShortcuts();

  const activeId = getActiveGameId();
  if (activeId && getEnabledOverrideForGame(activeId)) {
    reapplyEffectiveColor({ notify: false });
    if (opts?.notify !== false) {
      notifyProfile(
        preset.title,
        true,
        'Preset salvo nas cores gerais (override do jogo ainda ativo no display).',
      );
    }
    return true;
  }

  const result = applyDisplayColor(settings);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('profile:apply', {
      profileId: preset.id,
      settings,
      ok: result.ok,
      message: result.message,
    });
  }

  if (opts?.notify !== false) {
    notifyProfile(preset.title, result.ok, result.message);
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

  // Tasks aparecem no clique direito do ícone na barra de tarefas
  app.setJumpList([
    {
      type: 'custom',
      name: 'Perfis de cores recentes',
      items: recent.map((entry) => ({
        type: 'task' as const,
        title: entry.shortTitle,
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
        label: entry.shortTitle,
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

  tray = new Tray(createTrayImage());
  tray.setToolTip('Apex Suite — clique direito para perfis');
  tray.on('click', () => showMainWindow());
  tray.on('double-click', () => showMainWindow());
  rebuildTrayMenu();
}

function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    frame: true,
    title: 'Apex Suite',
    backgroundColor: '#0b0d10',
    show: false,
    skipTaskbar: false,
    icon: resolveIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    if (wantsStartHidden(process.argv)) {
      hideToTray();
    } else {
      mainWindow?.show();
    }
  });

  if (isDev) {
    void mainWindow.loadURL('http://localhost:4444');
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../../dist/apex-suite/browser/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  // X / Alt+F4 → bandeja (some da barra de tarefas)
  mainWindow.on('close', (event) => {
    if (isQuitting) return;
    event.preventDefault();
    hideToTray();
  });

  // Minimizar nativo → também vai para a bandeja
  mainWindow.on('minimize', () => {
    if (isQuitting) return;
    hideToTray();
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

    // Aplica cores gerais (ou override se já houver jogo rodando)
    startGameDetector(onActiveGameChanged);
    reapplyEffectiveColor({ notify: false });

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
    stopGameDetector();
    resetDisplayColor();
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });

  app.on('window-all-closed', () => {
    // Mantém vivo na barra de tarefas / tray
  });

  ipcMain.on('window:minimize', () => hideToTray());
  ipcMain.on('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('window:close', () => hideToTray());
  ipcMain.on('window:quit', () => {
    isQuitting = true;
    app.quit();
  });

  ipcMain.handle('app:getVersion', () => app.getVersion());
  ipcMain.handle('app:getOpenAtLogin', () => getOpenAtLogin());
  ipcMain.handle('app:setOpenAtLogin', (_event, enabled: boolean) => setOpenAtLogin(!!enabled));
  ipcMain.handle('system:getSnapshot', async () => collectSystemSnapshot());
  ipcMain.handle('display:list', async () => listDisplayDevices());
  ipcMain.handle('display:probeGamma', async () => probeGammaRampApi());
  ipcMain.handle(
    'display:applyColor',
    async (_event, payload: { settings: DisplayColorSettings; displayId?: string | null }) => {
      saveGlobalColorSettings(payload.settings);
      const activeId = getActiveGameId();
      if (activeId && getEnabledOverrideForGame(activeId)) {
        reapplyEffectiveColor({ notify: false });
        return {
          ok: true,
          api: 'SetDeviceGammaRamp',
          message:
            'Cores gerais salvas. O override do jogo ativo continua no display.',
        };
      }
      return applyDisplayColor(payload.settings, payload.displayId);
    },
  );
  ipcMain.handle('display:resetColor', async (_event, displayId?: string | null) => {
    const result = resetDisplayColor(displayId);
    saveGlobalColorSettings(result.settings);
    return result;
  });

  ipcMain.handle('games:list', () =>
    KNOWN_GAMES.map((game) => ({
      ...game,
      override: getGameOverride(game.id),
      running: getActiveGameId() === game.id,
    })),
  );
  ipcMain.handle('games:listOverrides', () => listGameOverrides());
  ipcMain.handle('games:getActive', () => {
    const id = getActiveGameId();
    const game = id ? findGameById(id) : null;
    const override = id ? getEnabledOverrideForGame(id) : null;
    return {
      gameId: id,
      title: game?.title ?? null,
      overrideActive: Boolean(override),
      settings: override?.settings ?? getGlobalColorSettings(),
      source: override ? 'game' : 'global',
    };
  });
  ipcMain.handle(
    'games:upsertOverride',
    (_event, patch: Partial<GameColorOverride> & { gameId: string }) => {
      const next = upsertGameOverride(patch);
      if (getActiveGameId() === next.gameId) {
        reapplyEffectiveColor({ notify: true });
      }
      return next;
    },
  );
  ipcMain.handle(
    'games:applyPreset',
    (_event, payload: { gameId: string; presetId: string; enabled?: boolean }) => {
      const settings = settingsFromProfileId(payload.presetId);
      const next = upsertGameOverride({
        gameId: payload.gameId,
        presetId: payload.presetId,
        settings,
        enabled: payload.enabled ?? true,
      });
      if (getActiveGameId() === next.gameId && next.enabled) {
        reapplyEffectiveColor({ notify: true });
      }
      return next;
    },
  );
  ipcMain.handle('games:getGlobalSettings', () => getGlobalColorSettings());
  ipcMain.handle('games:listPresets', () =>
    listColorProfiles().map((p) => ({
      id: p.id,
      title: p.title,
      code: p.code,
      builtin: p.builtin,
    })),
  );

  ipcMain.handle('profiles:list', () => listColorProfiles());
  ipcMain.handle(
    'profiles:create',
    (
      _event,
      input: {
        title: string;
        description?: string;
        settings: DisplayColorSettings;
        icon?: string;
      },
    ) => {
      const created = createColorProfile(input);
      pushRecentProfileId(created.id);
      refreshWindowsShortcuts();
      return created;
    },
  );
  ipcMain.handle(
    'profiles:update',
    (
      _event,
      payload: {
        id: string;
        title?: string;
        description?: string;
        settings?: DisplayColorSettings;
        icon?: string;
      },
    ) => {
      const updated = updateColorProfile(payload.id, payload);
      refreshWindowsShortcuts();
      return updated;
    },
  );
  ipcMain.handle('profiles:delete', (_event, id: string) => {
    const ok = deleteColorProfile(id);
    refreshWindowsShortcuts();
    return { ok };
  });
  ipcMain.handle('profiles:export', async (_event, ids?: string[] | null) =>
    exportColorProfiles(mainWindow, ids),
  );
  ipcMain.handle('profiles:import', async () => {
    const result = await importColorProfiles(mainWindow);
    refreshWindowsShortcuts();
    return result;
  });
  ipcMain.handle('profiles:get', (_event, id: string) => findColorProfile(id));

  ipcMain.handle('profiles:listRecent', () => resolveRecentProfiles(loadRecentProfileIds()));
  ipcMain.handle('profiles:recordRecent', (_event, profileId: string) => {
    const ids = pushRecentProfileId(profileId);
    refreshWindowsShortcuts();
    return resolveRecentProfiles(ids);
  });
  ipcMain.handle('profiles:listAll', () =>
    listColorProfiles().map((p) => ({
      id: p.id,
      title: p.title,
      shortTitle: p.title,
      builtin: p.builtin,
    })),
  );

  ipcMain.handle('update:check', () => autoUpdater.checkForUpdates());
  ipcMain.handle('update:download', () => autoUpdater.downloadUpdate());
  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall();
  });
}
