/**
 * Windows GDI Gamma Ramp API (gdi32):
 *   GetDeviceGammaRamp / SetDeviceGammaRamp
 * Ramp layout: WORD red[256], green[256], blue[256] (1536 bytes).
 */
import koffi, { type LibraryHandle } from 'koffi';
import si from 'systeminformation';
import {
  DEFAULT_COLOR_SETTINGS,
  type DisplayColorSettings,
  type DisplayDeviceInfo,
} from '../shared/display-color.model';

const RAMP_ENTRIES = 256;
const RAMP_BYTES = RAMP_ENTRIES * 3 * 2; // 3 channels × 256 × WORD

type GammaRampChannels = {
  red: number[];
  green: number[];
  blue: number[];
};

type WinDisplay = {
  deviceName: string;
  deviceString: string;
  primary: boolean;
  index: number;
};

let gdi32: LibraryHandle | null = null;
let user32: LibraryHandle | null = null;

let EnumDisplayDevicesW:
  | ((lpDevice: null, iDevNum: number, lpDisplayDevice: Buffer, dwFlags: number) => boolean)
  | null = null;
let CreateDCW:
  | ((lpszDriver: string | null, lpszDevice: string | null, lpszOutput: null, lpInitData: null) => unknown)
  | null = null;
let DeleteDC: ((hdc: unknown) => boolean) | null = null;
let GetDC: ((hWnd: null) => unknown) | null = null;
let ReleaseDC: ((hWnd: null, hdc: unknown) => number) | null = null;
let GetDeviceGammaRamp: ((hdc: unknown, lpRamp: Buffer) => boolean) | null = null;
let SetDeviceGammaRamp: ((hdc: unknown, lpRamp: Buffer) => boolean) | null = null;

/** Baseline ramps captured via GetDeviceGammaRamp (per device). */
const baselineRamps = new Map<string, Buffer>();

const DISPLAY_DEVICE_ACTIVE = 0x00000001;
const DISPLAY_DEVICE_PRIMARY_DEVICE = 0x00000004;
const DISPLAY_DEVICE_W_SIZE = 4 + 32 * 2 + 128 * 2 + 4 + 128 * 2 + 128 * 2; // 840

function ensureWinApis(): boolean {
  if (process.platform !== 'win32') return false;
  if (SetDeviceGammaRamp && GetDeviceGammaRamp) return true;

  try {
    gdi32 = koffi.load('gdi32.dll');
    user32 = koffi.load('user32.dll');

    EnumDisplayDevicesW = user32.func(
      'bool __stdcall EnumDisplayDevicesW(void *lpDevice, uint32 iDevNum, void *lpDisplayDevice, uint32 dwFlags)',
    );
    CreateDCW = gdi32.func(
      'void * __stdcall CreateDCW(str16 lpszDriver, str16 lpszDevice, void *lpszOutput, void *lpInitData)',
    );
    DeleteDC = gdi32.func('bool __stdcall DeleteDC(void *hdc)');
    GetDC = user32.func('void * __stdcall GetDC(void *hWnd)');
    ReleaseDC = user32.func('int __stdcall ReleaseDC(void *hWnd, void *hDC)');
    GetDeviceGammaRamp = gdi32.func('bool __stdcall GetDeviceGammaRamp(void *hdc, void *lpRamp)');
    SetDeviceGammaRamp = gdi32.func('bool __stdcall SetDeviceGammaRamp(void *hdc, void *lpRamp)');
    return true;
  } catch {
    gdi32 = null;
    user32 = null;
    EnumDisplayDevicesW = null;
    CreateDCW = null;
    DeleteDC = null;
    GetDC = null;
    ReleaseDC = null;
    GetDeviceGammaRamp = null;
    SetDeviceGammaRamp = null;
    return false;
  }
}

function readUtf16z(buf: Buffer, offset: number, maxChars: number): string {
  const end = offset + maxChars * 2;
  const chars: number[] = [];
  for (let i = offset; i < end; i += 2) {
    const code = buf.readUInt16LE(i);
    if (code === 0) break;
    chars.push(code);
  }
  return String.fromCharCode(...chars);
}

function enumWinDisplays(): WinDisplay[] {
  if (!ensureWinApis() || !EnumDisplayDevicesW) return [];

  const list: WinDisplay[] = [];
  const device = Buffer.alloc(DISPLAY_DEVICE_W_SIZE);

  for (let i = 0; i < 16; i++) {
    device.fill(0);
    device.writeUInt32LE(DISPLAY_DEVICE_W_SIZE, 0);
    const ok = EnumDisplayDevicesW(null, i, device, 0);
    if (!ok) break;

    const stateFlags = device.readUInt32LE(4 + 32 * 2 + 128 * 2);
    if ((stateFlags & DISPLAY_DEVICE_ACTIVE) === 0) continue;

    const deviceName = readUtf16z(device, 4, 32);
    const deviceString = readUtf16z(device, 4 + 32 * 2, 128);
    if (!deviceName) continue;

    list.push({
      deviceName,
      deviceString: deviceString || deviceName,
      primary: (stateFlags & DISPLAY_DEVICE_PRIMARY_DEVICE) !== 0,
      index: list.length,
    });
  }

  return list;
}

function openDisplayDc(deviceName?: string | null): { hdc: unknown; release: () => void } | null {
  if (!ensureWinApis()) return null;

  if (deviceName && CreateDCW && DeleteDC) {
    // Windows Gamma Ramp API: CreateDC("DISPLAY", "\\.\DISPLAYn", NULL, NULL)
    const hdc = CreateDCW('DISPLAY', deviceName, null, null);
    if (hdc) {
      return {
        hdc,
        release: () => {
          DeleteDC?.(hdc);
        },
      };
    }
  }

  if (!GetDC || !ReleaseDC) return null;
  const hdc = GetDC(null);
  if (!hdc) return null;
  return {
    hdc,
    release: () => {
      ReleaseDC?.(null, hdc);
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Soft kelvin tint — stay within values SetDeviceGammaRamp commonly accepts. */
function kelvinScales(kelvin: number): { r: number; g: number; b: number } {
  const delta = (kelvin - 6500) / 4000;
  return {
    r: clamp(1 - delta * 0.16, 0.72, 1.18),
    g: clamp(1 - Math.abs(delta) * 0.04, 0.85, 1.1),
    b: clamp(1 + delta * 0.2, 0.7, 1.22),
  };
}

/**
 * Build RGB WORD tables for SetDeviceGammaRamp.
 * Values are kept close enough to identity so most GPU drivers accept the call.
 */
export function buildGammaRamp(settings: DisplayColorSettings): GammaRampChannels {
  // Conservative scales — aggressive ramps are rejected by SetDeviceGammaRamp
  const brightnessScale = 0.72 + (settings.brightness / 100) * 0.56; // ~0.72..1.28
  const contrastFactor = clamp(0.75 + (settings.contrast / 100) * 0.5, 0.75, 1.25);
  const gamma = clamp(settings.gamma, 1.6, 2.6);
  const blackLift = (settings.blackEq / 20) * 0.12;
  const vibrance = clamp(settings.vibrance / 100, -0.45, 0.45);
  const temp = kelvinScales(settings.kelvin);
  const chR = clamp(settings.channelR / 100, 0.7, 1.3);
  const chG = clamp(settings.channelG / 100, 0.7, 1.3);
  const chB = clamp(settings.channelB / 100, 0.7, 1.3);

  const red: number[] = [];
  const green: number[] = [];
  const blue: number[] = [];

  for (let i = 0; i < RAMP_ENTRIES; i++) {
    let v = i / 255;
    // Map UI gamma (2.2 = neutral) onto power curve around identity
    const gammaPower = 2.2 / gamma;
    v = Math.pow(Math.max(v, 0), gammaPower);
    v = v + blackLift * Math.pow(1 - v, 2);
    v = (v - 0.5) * contrastFactor + 0.5;
    v *= brightnessScale;
    v = clamp(v, 0, 1);

    let r = v * temp.r * chR;
    let g = v * temp.g * chG;
    let b = v * temp.b * chB;

    const gray = (r + g + b) / 3;
    r = gray + (r - gray) * (1 + vibrance);
    g = gray + (g - gray) * (1 + vibrance);
    b = gray + (b - gray) * (1 + vibrance);

    red.push(Math.round(clamp(r, 0, 1) * 65535));
    green.push(Math.round(clamp(g, 0, 1) * 65535));
    blue.push(Math.round(clamp(b, 0, 1) * 65535));
  }

  return {
    red: enforceMonotonic(red),
    green: enforceMonotonic(green),
    blue: enforceMonotonic(blue),
  };
}

/** Identity ramp: WORD value = index << 8 (Windows default). */
export function buildIdentityRamp(): GammaRampChannels {
  const red: number[] = [];
  const green: number[] = [];
  const blue: number[] = [];
  for (let i = 0; i < RAMP_ENTRIES; i++) {
    const value = i << 8;
    red.push(value);
    green.push(value);
    blue.push(value);
  }
  return { red, green, blue };
}

/** Drivers require non-decreasing entries for SetDeviceGammaRamp. */
function enforceMonotonic(channel: number[]): number[] {
  const out = [...channel];
  out[0] = clamp(out[0] ?? 0, 0, 65535);
  for (let i = 1; i < RAMP_ENTRIES; i++) {
    const prev = out[i - 1] ?? 0;
    const cur = out[i] ?? 0;
    out[i] = clamp(Math.max(cur, prev), 0, 65535);
  }
  return out;
}

function rampToBuffer(ramp: GammaRampChannels): Buffer {
  const buf = Buffer.alloc(RAMP_BYTES);
  for (let i = 0; i < RAMP_ENTRIES; i++) {
    buf.writeUInt16LE(ramp.red[i] ?? 0, i * 2);
    buf.writeUInt16LE(ramp.green[i] ?? 0, 512 + i * 2);
    buf.writeUInt16LE(ramp.blue[i] ?? 0, 1024 + i * 2);
  }
  return buf;
}

function bufferToRamp(buf: Buffer): GammaRampChannels {
  const red: number[] = [];
  const green: number[] = [];
  const blue: number[] = [];
  for (let i = 0; i < RAMP_ENTRIES; i++) {
    red.push(buf.readUInt16LE(i * 2));
    green.push(buf.readUInt16LE(512 + i * 2));
    blue.push(buf.readUInt16LE(1024 + i * 2));
  }
  return { red, green, blue };
}

function withDisplayDc<T>(
  deviceName: string | null | undefined,
  fn: (hdc: unknown) => T,
): T | null {
  const opened = openDisplayDc(deviceName);
  if (!opened) return null;
  try {
    return fn(opened.hdc);
  } finally {
    opened.release();
  }
}

function captureBaseline(deviceName: string | null | undefined): void {
  if (!GetDeviceGammaRamp) return;
  const key = deviceName ?? '__primary__';
  if (baselineRamps.has(key)) return;

  withDisplayDc(deviceName, (hdc) => {
    const buf = Buffer.alloc(RAMP_BYTES);
    if (GetDeviceGammaRamp?.(hdc, buf)) {
      baselineRamps.set(key, Buffer.from(buf));
    }
  });
}

function applyRampBuffer(deviceName: string | null | undefined, rampBuf: Buffer): boolean {
  if (!SetDeviceGammaRamp) return false;
  captureBaseline(deviceName);

  const result = withDisplayDc(deviceName, (hdc) => {
    return !!SetDeviceGammaRamp?.(hdc, rampBuf);
  });
  return result === true;
}

function resolveDeviceName(displayId?: string | null): string | null {
  const wins = enumWinDisplays();
  if (!wins.length) return null;

  if (displayId != null && displayId !== '') {
    const byName = wins.find((d) => d.deviceName === displayId);
    if (byName) return byName.deviceName;

    const byIndex = wins.find((d) => String(d.index) === displayId);
    if (byIndex) return byIndex.deviceName;
  }

  return wins.find((d) => d.primary)?.deviceName ?? wins[0]?.deviceName ?? null;
}

export function probeGammaRampApi(): {
  ok: boolean;
  message: string;
  api: 'SetDeviceGammaRamp';
} {
  if (process.platform !== 'win32') {
    return {
      ok: false,
      api: 'SetDeviceGammaRamp',
      message: 'Windows Gamma Ramp API disponível apenas no Windows.',
    };
  }
  if (!ensureWinApis() || !GetDeviceGammaRamp || !SetDeviceGammaRamp) {
    return {
      ok: false,
      api: 'SetDeviceGammaRamp',
      message: 'Falha ao carregar gdi32 Get/SetDeviceGammaRamp.',
    };
  }

  const deviceName = resolveDeviceName(null);
  const probed = withDisplayDc(deviceName, (hdc) => {
    const buf = Buffer.alloc(RAMP_BYTES);
    const got = !!GetDeviceGammaRamp?.(hdc, buf);
    if (!got) return false;
    // Round-trip identity write to confirm Set is allowed
    return !!SetDeviceGammaRamp?.(hdc, buf);
  });

  return {
    ok: probed === true,
    api: 'SetDeviceGammaRamp',
    message:
      probed === true
        ? 'Windows Gamma Ramp API (Get/SetDeviceGammaRamp) ativa.'
        : 'Driver recusou Get/SetDeviceGammaRamp neste display.',
  };
}

export function applyDisplayColor(
  settings: DisplayColorSettings,
  displayId?: string | null,
): { ok: boolean; message: string; api: string } {
  if (process.platform !== 'win32') {
    return {
      ok: false,
      api: 'SetDeviceGammaRamp',
      message: 'Windows Gamma Ramp API disponível apenas no Windows.',
    };
  }
  if (!ensureWinApis()) {
    return {
      ok: false,
      api: 'SetDeviceGammaRamp',
      message: 'Não foi possível carregar gdi32.dll / user32.dll.',
    };
  }

  const deviceName = resolveDeviceName(displayId);
  const ok = applyRampBuffer(deviceName, rampToBuffer(buildGammaRamp(settings)));
  return {
    ok,
    api: 'SetDeviceGammaRamp',
    message: ok
      ? `SetDeviceGammaRamp aplicado${deviceName ? ` em ${deviceName}` : ''}.`
      : 'SetDeviceGammaRamp falhou (driver ou rampa rejeitada).',
  };
}

export function resetDisplayColor(displayId?: string | null): {
  ok: boolean;
  message: string;
  settings: DisplayColorSettings;
  api: string;
} {
  const settings = { ...DEFAULT_COLOR_SETTINGS };
  if (process.platform !== 'win32') {
    return {
      ok: false,
      settings,
      api: 'SetDeviceGammaRamp',
      message: 'Reset via Gamma Ramp disponível apenas no Windows.',
    };
  }
  if (!ensureWinApis()) {
    return {
      ok: false,
      settings,
      api: 'SetDeviceGammaRamp',
      message: 'Não foi possível carregar a Windows Gamma Ramp API.',
    };
  }

  const deviceName = resolveDeviceName(displayId);
  const key = deviceName ?? '__primary__';
  captureBaseline(deviceName);

  const baseline = baselineRamps.get(key);
  const rampBuf = baseline ?? rampToBuffer(buildIdentityRamp());
  const ok = applyRampBuffer(deviceName, rampBuf);

  return {
    ok,
    settings,
    api: 'SetDeviceGammaRamp',
    message: ok
      ? baseline
        ? 'Rampa original restaurada via SetDeviceGammaRamp.'
        : 'Rampa identidade (i<<8) aplicada via SetDeviceGammaRamp.'
      : 'Falha ao restaurar via SetDeviceGammaRamp.',
  };
}

export function readCurrentGammaRamp(displayId?: string | null): GammaRampChannels | null {
  if (!ensureWinApis() || !GetDeviceGammaRamp) return null;
  const deviceName = resolveDeviceName(displayId);
  return withDisplayDc(deviceName, (hdc) => {
    const buf = Buffer.alloc(RAMP_BYTES);
    if (!GetDeviceGammaRamp?.(hdc, buf)) return null;
    return bufferToRamp(buf);
  });
}

export async function listDisplayDevices(): Promise<DisplayDeviceInfo[]> {
  const winDisplays = ensureWinApis() ? enumWinDisplays() : [];
  const graphics = await si.graphics();
  const siDisplays = graphics.displays ?? [];

  if (winDisplays.length) {
    return winDisplays.map((win, index) => {
      const si = siDisplays[index];
      const width = si?.resolutionX || si?.currentResX || 0;
      const height = si?.resolutionY || si?.currentResY || 0;
      const refresh = si?.currentRefreshRate ?? null;
      const sizeInch =
        typeof si?.sizeX === 'number' && typeof si?.sizeY === 'number'
          ? Math.round(Math.sqrt(si.sizeX ** 2 + si.sizeY ** 2) * 10) / 10
          : null;

      return {
        id: win.deviceName,
        label: win.primary
          ? `DISPLAY ${String(index + 1).padStart(2, '0')} [PRIMÁRIO]`
          : `DISPLAY ${String(index + 1).padStart(2, '0')} [SECUNDÁRIO]`,
        model: si?.model || win.deviceString,
        connection: String(si?.connection || win.deviceName),
        resolution:
          width && height
            ? `${width}x${height}${refresh ? ` @ ${refresh}Hz` : ''}`
            : win.deviceName,
        refreshRate: typeof refresh === 'number' ? refresh : null,
        primary: win.primary,
        sizeInch,
      };
    });
  }

  if (!siDisplays.length) {
    return [
      {
        id: '0',
        label: 'DISPLAY 01 [PRIMÁRIO]',
        model: 'Display Principal',
        connection: '—',
        resolution: '—',
        refreshRate: null,
        primary: true,
        sizeInch: null,
      },
    ];
  }

  return siDisplays.map((display, index) => {
    const width = display.resolutionX || display.currentResX || 0;
    const height = display.resolutionY || display.currentResY || 0;
    const refresh = display.currentRefreshRate;
    const sizeInch =
      typeof display.sizeX === 'number' && typeof display.sizeY === 'number'
        ? Math.round(Math.sqrt(display.sizeX ** 2 + display.sizeY ** 2) * 10) / 10
        : null;

    return {
      id: String(index),
      label: display.main
        ? `DISPLAY ${String(index + 1).padStart(2, '0')} [PRIMÁRIO]`
        : `DISPLAY ${String(index + 1).padStart(2, '0')} [SECUNDÁRIO]`,
      model: display.model || display.deviceName || `Display ${index + 1}`,
      connection: String(display.connection || display.vendor || '—'),
      resolution:
        width && height
          ? `${width}x${height}${refresh ? ` @ ${refresh}Hz` : ''}`
          : '—',
      refreshRate: typeof refresh === 'number' ? refresh : null,
      primary: Boolean(display.main || index === 0),
      sizeInch,
    };
  });
}
