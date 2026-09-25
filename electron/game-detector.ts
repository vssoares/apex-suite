import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  findGameByProcessName,
  KNOWN_GAMES,
  type GameDefinition,
} from '../shared/game-color.model';

const execFileAsync = promisify(execFile);
const POLL_MS = 2500;

export type GameDetectorHandler = (game: GameDefinition | null) => void;

let timer: ReturnType<typeof setInterval> | null = null;
let activeGameId: string | null = null;
let handler: GameDetectorHandler | null = null;

function knownProcessSet(): Set<string> {
  const set = new Set<string>();
  for (const game of KNOWN_GAMES) {
    for (const name of game.processNames) {
      set.add(name.toLowerCase());
    }
  }
  return set;
}

async function listRunningProcessNames(): Promise<string[]> {
  if (process.platform !== 'win32') return [];

  try {
    const { stdout } = await execFileAsync(
      'tasklist',
      ['/FO', 'CSV', '/NH'],
      { windowsHide: true, maxBuffer: 8 * 1024 * 1024 },
    );

    const names: string[] = [];
    for (const line of stdout.split(/\r?\n/)) {
      // "name.exe","pid","session","session#","mem"
      const match = line.match(/^"([^"]+\.exe)"/i);
      if (match?.[1]) names.push(match[1]);
    }
    return names;
  } catch {
    return [];
  }
}

async function detectActiveGame(): Promise<GameDefinition | null> {
  const running = await listRunningProcessNames();
  const known = knownProcessSet();

  for (const name of running) {
    if (!known.has(name.toLowerCase())) continue;
    const game = findGameByProcessName(name);
    if (game) return game;
  }
  return null;
}

async function tick(): Promise<void> {
  const game = await detectActiveGame();
  const nextId = game?.id ?? null;
  if (nextId === activeGameId) return;
  activeGameId = nextId;
  handler?.(game);
}

export function getActiveGameId(): string | null {
  return activeGameId;
}

export function startGameDetector(onChange: GameDetectorHandler): void {
  handler = onChange;
  void tick();
  if (timer) clearInterval(timer);
  timer = setInterval(() => void tick(), POLL_MS);
}

export function stopGameDetector(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  handler = null;
  activeGameId = null;
}
