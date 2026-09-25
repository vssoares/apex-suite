import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { findColorProfile, listColorProfiles } from './color-profiles-store';

const MAX_RECENT = 4;
const STORE_FILE = 'recent-color-profiles.json';

export type RecentProfileEntry = {
  id: string;
  title: string;
  shortTitle: string;
};

function storePath(): string {
  return path.join(app.getPath('userData'), STORE_FILE);
}

function defaultRecentIds(): string[] {
  return listColorProfiles()
    .slice(0, MAX_RECENT)
    .map((p) => p.id);
}

function toEntry(id: string): RecentProfileEntry | null {
  const preset = findColorProfile(id);
  if (!preset) return null;
  return {
    id: preset.id,
    title: preset.title,
    shortTitle: preset.title.length > 22 ? `${preset.title.slice(0, 20)}…` : preset.title,
  };
}

export function loadRecentProfileIds(): string[] {
  try {
    const raw = fs.readFileSync(storePath(), 'utf8');
    const parsed = JSON.parse(raw) as { ids?: string[] };
    const ids = (parsed.ids ?? []).filter((id) => findColorProfile(id));
    return ids.length ? ids.slice(0, MAX_RECENT) : defaultRecentIds();
  } catch {
    return defaultRecentIds();
  }
}

export function pushRecentProfileId(profileId: string): string[] {
  if (!findColorProfile(profileId)) {
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
    // ignore
  }

  return next;
}

export function resolveRecentProfiles(ids = loadRecentProfileIds()): RecentProfileEntry[] {
  return ids.map((id) => toEntry(id)).filter((entry): entry is RecentProfileEntry => entry != null);
}

export function findPresetById(profileId: string) {
  return findColorProfile(profileId);
}
