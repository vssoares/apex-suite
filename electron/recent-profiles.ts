import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { COLOR_PROFILE_PRESETS } from '../shared/display-color.model';

const MAX_RECENT = 4;
const STORE_FILE = 'recent-color-profiles.json';

export type RecentProfileEntry = {
  id: string;
  title: string;
};

function storePath(): string {
  return path.join(app.getPath('userData'), STORE_FILE);
}

function defaultRecentIds(): string[] {
  return COLOR_PROFILE_PRESETS.map((p) => p.id).slice(0, MAX_RECENT);
}

export function loadRecentProfileIds(): string[] {
  try {
    const raw = fs.readFileSync(storePath(), 'utf8');
    const parsed = JSON.parse(raw) as { ids?: string[] };
    const ids = (parsed.ids ?? []).filter((id) =>
      COLOR_PROFILE_PRESETS.some((p) => p.id === id),
    );
    return ids.length ? ids.slice(0, MAX_RECENT) : defaultRecentIds();
  } catch {
    return defaultRecentIds();
  }
}

export function pushRecentProfileId(profileId: string): string[] {
  if (!COLOR_PROFILE_PRESETS.some((p) => p.id === profileId)) {
    return loadRecentProfileIds();
  }

  const next = [
    profileId,
    ...loadRecentProfileIds().filter((id) => id !== profileId),
  ].slice(0, MAX_RECENT);

  try {
    fs.mkdirSync(path.dirname(storePath()), { recursive: true });
    fs.writeFileSync(storePath(), JSON.stringify({ ids: next }, null, 2), 'utf8');
  } catch {
    // ignore persistence errors
  }

  return next;
}

export function resolveRecentProfiles(ids = loadRecentProfileIds()): RecentProfileEntry[] {
  return ids
    .map((id) => {
      const preset = COLOR_PROFILE_PRESETS.find((p) => p.id === id);
      return preset ? { id: preset.id, title: preset.title } : null;
    })
    .filter((entry): entry is RecentProfileEntry => entry != null);
}

export function findPresetById(profileId: string) {
  return COLOR_PROFILE_PRESETS.find((p) => p.id === profileId) ?? null;
}
