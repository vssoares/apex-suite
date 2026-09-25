export interface DisplayColorSettings {
  brightness: number;
  contrast: number;
  blackEq: number;
  vibrance: number;
  sharpness: number;
  gamma: number;
  kelvin: number;
  channelR: number;
  channelG: number;
  channelB: number;
  profileId: string;
}

export interface DisplayDeviceInfo {
  id: string;
  label: string;
  model: string;
  connection: string;
  resolution: string;
  refreshRate: number | null;
  primary: boolean;
  sizeInch: number | null;
}

export interface ColorProfilePreset {
  id: string;
  title: string;
  description: string;
  icon: string;
  code: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  rightTone?: 'default' | 'primary';
  settings: Partial<DisplayColorSettings>;
}

export type ColorField = keyof Omit<DisplayColorSettings, 'profileId'>;

export const DEFAULT_COLOR_SETTINGS: DisplayColorSettings = {
  brightness: 50,
  contrast: 50,
  blackEq: 10,
  vibrance: 0,
  sharpness: 0,
  gamma: 2.2,
  kelvin: 6500,
  channelR: 100,
  channelG: 100,
  channelB: 100,
  profileId: 'windows-default',
};

export const COLOR_FIELD_DEFAULTS: Record<ColorField, number> = {
  brightness: 50,
  contrast: 50,
  blackEq: 10,
  vibrance: 0,
  sharpness: 0,
  gamma: 2.2,
  kelvin: 6500,
  channelR: 100,
  channelG: 100,
  channelB: 100,
};

/** Presets tuned for real gamma-ramp feel (not exaggerated). */
export const COLOR_PROFILE_PRESETS: ColorProfilePreset[] = [
  {
    id: 'fps',
    title: 'FPS Competitivo / Black EQ',
    description:
      'Sombras abertas e contraste firme para achar alvos em cantos escuros sem estourar os highlights.',
    icon: 'verified',
    code: 'P-01',
    leftLabel: 'Black EQ',
    leftValue: 'Nv. 12',
    rightLabel: 'Vibrance',
    rightValue: '+18%',
    rightTone: 'primary',
    settings: {
      brightness: 54,
      contrast: 58,
      blackEq: 12,
      vibrance: 18,
      sharpness: 30,
      gamma: 2.15,
      kelvin: 6700,
      channelR: 100,
      channelG: 100,
      channelB: 104,
    },
  },
  {
    id: 'cyber',
    title: 'Vibrante Cyber / RPG',
    description:
      'Saturação rica e gama mais profunda para mundos coloridos, neon e cutscenes imersivas.',
    icon: 'sports_esports',
    code: 'P-02',
    leftLabel: 'Gama',
    leftValue: '2.4',
    rightLabel: 'Saturação',
    rightValue: '+32%',
    settings: {
      brightness: 56,
      contrast: 56,
      blackEq: 7,
      vibrance: 32,
      sharpness: 40,
      gamma: 2.4,
      kelvin: 6100,
      channelR: 106,
      channelG: 100,
      channelB: 110,
    },
  },
  {
    id: 'cinema',
    title: 'Cinema / Neutro D65',
    description:
      'Referência neutra 6500K com contraste equilibrado — ideal para filmes, edição e trabalho.',
    icon: 'movie',
    code: 'P-03',
    leftLabel: 'Temp',
    leftValue: '6500K',
    rightLabel: 'Gama',
    rightValue: '2.2',
    settings: {
      brightness: 50,
      contrast: 50,
      blackEq: 5,
      vibrance: 4,
      sharpness: 8,
      gamma: 2.2,
      kelvin: 6500,
      channelR: 100,
      channelG: 100,
      channelB: 100,
    },
  },
  {
    id: 'night',
    title: 'Modo Noturno / Anti-Fadiga',
    description:
      'Menos azul e brilho reduzido para sessões longas à noite, sem lavar demais as cores.',
    icon: 'bedtime',
    code: 'P-04',
    leftLabel: 'Luz Azul',
    leftValue: '-45%',
    rightLabel: 'Brilho',
    rightValue: '34%',
    settings: {
      brightness: 34,
      contrast: 46,
      blackEq: 4,
      vibrance: -8,
      sharpness: 5,
      gamma: 2.0,
      kelvin: 4800,
      channelR: 108,
      channelG: 100,
      channelB: 72,
    },
  },
];
