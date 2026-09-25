import { app, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import {
  COLOR_PROFILE_PRESETS,
  DEFAULT_COLOR_SETTINGS,
  type ColorProfilePreset,
  type DisplayColorSettings,
} from '../shared/display-color.model';

const STORE_FILE = 'color-profiles.json';
const EXPORT_FORMAT = 'apex-suite-color-profiles';

export type StoredColorProfile = ColorProfilePreset & {
  builtin: boolean;
  updatedAt: number;
};

type StoreShape = {
  custom: StoredColorProfile[];
};

function storePath(): string {
  return path.join(app.getPath('userData'), STORE_FILE);
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function uniqueId(title: string, existing: Set<string>): string {
  const base = slugify(title) || `perfil-${Date.now()}`;
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

function summarizeSettings(settings: DisplayColorSettings): Pick<
  ColorProfilePreset,
  'leftLabel' | 'leftValue' | 'rightLabel' | 'rightValue' | 'rightTone'
> {
  return {
    leftLabel: 'Temp',
    leftValue: `${settings.kelvin}K`,
    rightLabel: 'Vibrance',
    rightValue: `${settings.vibrance > 0 ? '+' : ''}${settings.vibrance}%`,
    rightTone: 'primary',
  };
}

function builtinProfiles(): StoredColorProfile[] {
  return COLOR_PROFILE_PRESETS.map((preset) => ({
    ...preset,
    builtin: true,
    updatedAt: 0,
  }));
}

function loadCustom(): StoredColorProfile[] {
  try {
    const raw = fs.readFileSync(storePath(), 'utf8');
    const parsed = JSON.parse(raw) as StoreShape;
    const builtinIds = new Set(COLOR_PROFILE_PRESETS.map((p) => p.id));
    return (parsed.custom ?? [])
      .filter((p) => p?.id && p?.title && !builtinIds.has(p.id))
      .map((p) => ({
        ...p,
        builtin: false,
        updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : Date.now(),
        settings: { ...DEFAULT_COLOR_SETTINGS, ...p.settings },
      }));
  } catch {
    return [];
  }
}

function saveCustom(custom: StoredColorProfile[]): void {
  try {
    fs.mkdirSync(path.dirname(storePath()), { recursive: true });
    fs.writeFileSync(storePath(), JSON.stringify({ custom }, null, 2), 'utf8');
  } catch {
    // ignore
  }
}

export function listColorProfiles(): StoredColorProfile[] {
  return [...builtinProfiles(), ...loadCustom()].sort((a, b) => {
    if (a.builtin !== b.builtin) return a.builtin ? -1 : 1;
    return a.title.localeCompare(b.title, 'pt-BR');
  });
}

export function findColorProfile(id: string): StoredColorProfile | null {
  return listColorProfiles().find((p) => p.id === id) ?? null;
}

export function settingsFromProfileId(profileId: string): DisplayColorSettings {
  const profile = findColorProfile(profileId);
  if (!profile) return { ...DEFAULT_COLOR_SETTINGS };
  return {
    ...DEFAULT_COLOR_SETTINGS,
    ...profile.settings,
    profileId: profile.id,
  };
}

export function createColorProfile(input: {
  title: string;
  description?: string;
  settings: DisplayColorSettings;
  icon?: string;
}): StoredColorProfile {
  const title = input.title.trim();
  if (!title) throw new Error('Informe um nome para o perfil.');

  const existing = new Set(listColorProfiles().map((p) => p.id));
  const id = uniqueId(title, existing);
  const code = `C-${String(loadCustom().length + 1).padStart(2, '0')}`;
  const summary = summarizeSettings(input.settings);

  const profile: StoredColorProfile = {
    id,
    title,
    description: input.description?.trim() || 'Perfil personalizado salvo localmente.',
    icon: input.icon || 'palette',
    code,
    ...summary,
    settings: {
      ...DEFAULT_COLOR_SETTINGS,
      ...input.settings,
      profileId: id,
    },
    builtin: false,
    updatedAt: Date.now(),
  };

  const custom = loadCustom();
  custom.push(profile);
  saveCustom(custom);
  return profile;
}

export function updateColorProfile(
  id: string,
  patch: {
    title?: string;
    description?: string;
    settings?: DisplayColorSettings;
    icon?: string;
  },
): StoredColorProfile {
  const custom = loadCustom();
  const index = custom.findIndex((p) => p.id === id);
  if (index < 0) throw new Error('Perfil embutido ou inexistente não pode ser editado assim.');

  const current = custom[index]!;
  const settings = patch.settings
    ? { ...DEFAULT_COLOR_SETTINGS, ...patch.settings, profileId: id }
    : current.settings;
  const summary = summarizeSettings({
    ...DEFAULT_COLOR_SETTINGS,
    ...settings,
    profileId: id,
  });

  const next: StoredColorProfile = {
    ...current,
    title: patch.title?.trim() || current.title,
    description: patch.description?.trim() || current.description,
    icon: patch.icon || current.icon,
    ...summary,
    settings,
    builtin: false,
    updatedAt: Date.now(),
  };

  custom[index] = next;
  saveCustom(custom);
  return next;
}

export function deleteColorProfile(id: string): boolean {
  if (COLOR_PROFILE_PRESETS.some((p) => p.id === id)) {
    throw new Error('Perfis embutidos não podem ser excluídos.');
  }
  const custom = loadCustom();
  const next = custom.filter((p) => p.id !== id);
  if (next.length === custom.length) return false;
  saveCustom(next);
  return true;
}

export async function exportColorProfiles(
  parent: BrowserWindow | null,
  ids?: string[] | null,
): Promise<{ ok: boolean; path?: string; message: string }> {
  const all = listColorProfiles();
  const selected =
    ids && ids.length ? all.filter((p) => ids.includes(p.id)) : all.filter((p) => !p.builtin);

  if (!selected.length) {
    return { ok: false, message: 'Nenhum perfil para exportar.' };
  }

  const saveOptions = {
    title: 'Exportar perfis de cor',
    defaultPath: path.join(app.getPath('documents'), 'apex-suite-color-profiles.json'),
    filters: [{ name: 'JSON', extensions: ['json'] }],
  };
  const result = parent
    ? await dialog.showSaveDialog(parent, saveOptions)
    : await dialog.showSaveDialog(saveOptions);

  if (result.canceled || !result.filePath) {
    return { ok: false, message: 'Exportação cancelada.' };
  }

  const payload = {
    format: EXPORT_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    profiles: selected.map(({ builtin: _b, updatedAt: _u, ...profile }) => profile),
  };

  fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), 'utf8');
  return {
    ok: true,
    path: result.filePath,
    message: `${selected.length} perfil(is) exportado(s).`,
  };
}

export async function importColorProfiles(
  parent: BrowserWindow | null,
): Promise<{ ok: boolean; imported: number; message: string }> {
  const openOptions = {
    title: 'Importar perfis de cor',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile' as const],
  };
  const result = parent
    ? await dialog.showOpenDialog(parent, openOptions)
    : await dialog.showOpenDialog(openOptions);

  if (result.canceled || !result.filePaths[0]) {
    return { ok: false, imported: 0, message: 'Importação cancelada.' };
  }

  try {
    const raw = fs.readFileSync(result.filePaths[0], 'utf8');
    const parsed = JSON.parse(raw) as {
      format?: string;
      profiles?: ColorProfilePreset[];
    };

    const list = Array.isArray(parsed.profiles)
      ? parsed.profiles
      : Array.isArray(parsed)
        ? (parsed as ColorProfilePreset[])
        : null;

    if (!list?.length) {
      return { ok: false, imported: 0, message: 'Arquivo sem perfis válidos.' };
    }

    let imported = 0;
    for (const item of list) {
      if (!item?.title || !item?.settings) continue;
      createColorProfile({
        title: item.title,
        description: item.description,
        settings: {
          ...DEFAULT_COLOR_SETTINGS,
          ...item.settings,
          profileId: 'custom',
        },
        icon: item.icon,
      });
      imported += 1;
    }

    return {
      ok: imported > 0,
      imported,
      message:
        imported > 0
          ? `${imported} perfil(is) importado(s) e salvos no computador.`
          : 'Nenhum perfil importado.',
    };
  } catch {
    return { ok: false, imported: 0, message: 'Falha ao ler o arquivo JSON.' };
  }
}
