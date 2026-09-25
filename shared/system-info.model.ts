export interface CpuInfo {
  brand: string;
  manufacturer: string;
  cores: number;
  physicalCores: number;
  speedGhz: number;
  usagePercent: number;
  temperatureC: number | null;
}

export interface GpuInfo {
  model: string;
  vendor: string;
  vramTotalGb: number;
  vramUsedGb: number | null;
  usagePercent: number | null;
  temperatureC: number | null;
  fanPercent: number | null;
  driverVersion: string | null;
}

export interface MemoryInfo {
  totalGb: number;
  usedGb: number;
  freeGb: number;
  cachedGb: number;
  usagePercent: number;
  type: string | null;
  clockMhz: number | null;
}

export interface StorageInfo {
  name: string;
  type: string;
  interfaceType: string;
  sizeGb: number;
  usedGb: number;
  freeGb: number;
  usagePercent: number;
  temperatureC: number | null;
  smartStatus: string | null;
}

export interface ProcessInfo {
  total: number;
  running: number;
  sleeping: number;
}

export interface OsInfo {
  distro: string;
  release: string;
  arch: string;
}

export interface SystemSnapshot {
  timestamp: number;
  cpu: CpuInfo;
  gpu: GpuInfo | null;
  memory: MemoryInfo;
  storage: StorageInfo | null;
  processes: ProcessInfo;
  os: OsInfo;
}

export const EMPTY_SYSTEM_SNAPSHOT: SystemSnapshot = {
  timestamp: 0,
  cpu: {
    brand: '—',
    manufacturer: '—',
    cores: 0,
    physicalCores: 0,
    speedGhz: 0,
    usagePercent: 0,
    temperatureC: null,
  },
  gpu: null,
  memory: {
    totalGb: 0,
    usedGb: 0,
    freeGb: 0,
    cachedGb: 0,
    usagePercent: 0,
    type: null,
    clockMhz: null,
  },
  storage: null,
  processes: { total: 0, running: 0, sleeping: 0 },
  os: { distro: '—', release: '—', arch: '—' },
};
