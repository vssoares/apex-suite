import {
  COLOR_PROFILE_PRESETS,
  DEFAULT_COLOR_SETTINGS,
  type DisplayColorSettings,
} from './display-color.model';

export interface GameDefinition {
  id: string;
  title: string;
  /** Process basenames to detect (case-insensitive). */
  processNames: string[];
  tag: string;
  imageUrl: string;
  defaultPresetId: string;
}

export interface GameColorOverride {
  gameId: string;
  enabled: boolean;
  /** Preset id or 'custom'. */
  presetId: string;
  settings: DisplayColorSettings;
}

export interface GameColorState {
  globalSettings: DisplayColorSettings;
  overrides: GameColorOverride[];
}

export interface ActiveGameColorPayload {
  gameId: string | null;
  title: string | null;
  settings: DisplayColorSettings;
  source: 'global' | 'game';
  message: string;
}

export const KNOWN_GAMES: GameDefinition[] = [
  {
    id: 'cyberpunk2077',
    title: 'Cyberpunk 2077',
    processNames: ['cyberpunk2077.exe'],
    tag: 'Ray Tracing / RPG',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASN3JMVwRi_XwnWvPMX3LEouOr0aeExdMqOllI03W8nOn9487rwJBPUFCnojvK2CVDGM25a9-ROGMOa_V1BFyJrgqWZy_o2SWli5KQte7nRE1Ynvd6L1GMGKpCMnRViy_J1duHSiDPnMFiSoiED3kwWqlmIZ_A_ezec_w5rLjhsNksDEZdjNirl4jNO9eyBVyHt8B4ZAji5dT_WmbZko6mz9gVk3GD_tODwqj0-KJ4cMbGerZI7o40tg',
    defaultPresetId: 'cyber',
  },
  {
    id: 'valorant',
    title: 'Valorant',
    processNames: ['valorant-win64-shipping.exe', 'valorant.exe'],
    tag: 'Competitivo FPS',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAuYt2BtNnIgT-1884Vkz_0_Xg18u92UYQIRU5uiss_RxyjFJSDO7nKqN1m2R2mgkO2jNKKgf2Jz1vPhrzTo4_vN3nxV1Z0xfummP6VkWuPFQNXO-45vu4fXtwb68xC6qqhCKOWrraG3PdOuZymfyC2wcB0wOlcSx3V3peXhcGaw260P4WMDv_m5vfmuXnatp8AQ3mqnJHR8eT9uUHy5J5iv8udXNyEg8kyvNuSjh78qULshb6wHiSoAA',
    defaultPresetId: 'fps',
  },
  {
    id: 'cs2',
    title: 'Counter-Strike 2',
    processNames: ['cs2.exe'],
    tag: 'Source 2 / Competitivo',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAz8RX8qPfKzTFuAnlxti-4Z9cSRQykUBfbVVQ3NrR1f3uEltk7EKv3k7H9IVpx1VsYqO72Ez2Mz_mgH5f30DU-gc-cJAacgJE8vaBkjttoSr8bwn-39OfdoxbJRHpPEjk3puZm31adJkrG7f00VxMcL89bF5tmVYbQduaeMqpsXhhhvyQTeXyBo1Dzu9YaB1EyOBB4BEfjkXkrshTboXZEaIppjhebl0UGySDhE-f98HEXLZ8au1ie2Q',
    defaultPresetId: 'fps',
  },
  {
    id: 'fortnite',
    title: 'Fortnite',
    processNames: ['fortniteclient-win64-shipping.exe', 'fortnite.exe'],
    tag: 'Battle Royale',
    imageUrl: '',
    defaultPresetId: 'cyber',
  },
  {
    id: 'lol',
    title: 'League of Legends',
    processNames: ['league of legends.exe', 'leagueclient.exe'],
    tag: 'MOBA',
    imageUrl: '',
    defaultPresetId: 'cinema',
  },
  {
    id: 'gta5',
    title: 'GTA V / GTA Online',
    processNames: ['gta5.exe', 'gtav.exe', 'playgtav.exe'],
    tag: 'Open World',
    imageUrl: '',
    defaultPresetId: 'cinema',
  },
];

export function findGameById(gameId: string): GameDefinition | null {
  return KNOWN_GAMES.find((g) => g.id === gameId) ?? null;
}

export function findGameByProcessName(processName: string): GameDefinition | null {
  const needle = processName.trim().toLowerCase();
  return (
    KNOWN_GAMES.find((g) => g.processNames.some((p) => p.toLowerCase() === needle)) ?? null
  );
}

export function settingsFromPreset(presetId: string): DisplayColorSettings {
  const preset = COLOR_PROFILE_PRESETS.find((p) => p.id === presetId);
  if (!preset) return { ...DEFAULT_COLOR_SETTINGS };
  return {
    ...DEFAULT_COLOR_SETTINGS,
    ...preset.settings,
    profileId: preset.id,
  };
}

export function defaultOverrideForGame(game: GameDefinition): GameColorOverride {
  return {
    gameId: game.id,
    enabled: false,
    presetId: game.defaultPresetId,
    settings: settingsFromPreset(game.defaultPresetId),
  };
}

export const EMPTY_GAME_COLOR_STATE: GameColorState = {
  globalSettings: { ...DEFAULT_COLOR_SETTINGS },
  overrides: [],
};
