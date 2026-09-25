import si from 'systeminformation';
import type { SystemSnapshot } from '../shared/system-info.model';

function bytesToGb(bytes: number): number {
  return bytes / 1024 ** 3;
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function pickPrimaryGpu(
  controllers: si.Systeminformation.GraphicsControllerData[],
): si.Systeminformation.GraphicsControllerData | undefined {
  if (!controllers.length) return undefined;
  return (
    controllers.find((c) => /nvidia|amd|radeon|geforce|rtx|gtx|radeon/i.test(`${c.vendor} ${c.model}`)) ??
    controllers[0]
  );
}

export async function collectSystemSnapshot(): Promise<SystemSnapshot> {
  // Skip full process list — si.processes() is expensive and drives RAM/CPU in the poll loop.
  const [cpu, speed, load, temp, mem, memLayout, graphics, disks, fsSize, osInfo] =
    await Promise.all([
      si.cpu(),
      si.cpuCurrentSpeed(),
      si.currentLoad(),
      si.cpuTemperature(),
      si.mem(),
      si.memLayout(),
      si.graphics(),
      si.diskLayout(),
      si.fsSize(),
      si.osInfo(),
    ]);

  const gpuController = pickPrimaryGpu(graphics.controllers ?? []);
  const memModule = memLayout[0];
  const disk = disks.find((d) => /nvme|ssd/i.test(`${d.interfaceType} ${d.type}`)) ?? disks[0];
  const rootFs =
    fsSize.find((f) => /^[cC]:/.test(f.fs)) ??
    fsSize.find((f) => f.mount === '/' || f.mount === 'C:\\') ??
    fsSize[0];

  const gpuRaw = gpuController as Record<string, unknown> | undefined;
  const vramMb = Number(gpuRaw?.['vram'] ?? 0);
  const vramTotalGb = vramMb > 0 ? round(vramMb / 1024, 1) : 0;
  const gpuUsage =
    typeof gpuRaw?.['utilizationGpu'] === 'number' ? round(gpuRaw['utilizationGpu'] as number) : null;
  const gpuMemUsage =
    typeof gpuRaw?.['utilizationMemory'] === 'number'
      ? round(gpuRaw['utilizationMemory'] as number)
      : null;

  const usedGb = round(bytesToGb(mem.active || mem.used), 1);
  const totalGb = round(bytesToGb(mem.total), 1);
  const freeGb = round(bytesToGb(mem.available || mem.free), 1);
  const cachedGb = round(bytesToGb(mem.buffcache || Math.max(mem.used - mem.active, 0)), 1);

  const storageSizeGb = disk ? round(bytesToGb(disk.size), 0) : 0;
  const storageUsedGb = rootFs ? round(bytesToGb(rootFs.used), 1) : 0;
  const storageFreeGb = rootFs ? round(bytesToGb(rootFs.available), 1) : 0;

  return {
    timestamp: Date.now(),
    cpu: {
      brand: cpu.brand?.trim() || 'CPU',
      manufacturer: cpu.manufacturer?.trim() || '—',
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      speedGhz: round(speed.avg || cpu.speed || 0, 2),
      usagePercent: round(load.currentLoad || 0),
      temperatureC: typeof temp.main === 'number' ? round(temp.main) : null,
    },
    gpu: gpuController
      ? {
          model: String(gpuController.model ?? 'GPU').trim() || 'GPU',
          vendor: String(gpuController.vendor ?? '—').trim() || '—',
          vramTotalGb,
          vramUsedGb:
            gpuMemUsage != null && vramTotalGb > 0
              ? round((vramTotalGb * gpuMemUsage) / 100, 1)
              : null,
          usagePercent: gpuUsage,
          temperatureC:
            typeof gpuRaw?.['temperatureGpu'] === 'number'
              ? round(gpuRaw['temperatureGpu'] as number)
              : null,
          fanPercent:
            typeof gpuRaw?.['fanSpeed'] === 'number' ? round(gpuRaw['fanSpeed'] as number) : null,
          driverVersion:
            typeof gpuRaw?.['driverVersion'] === 'string'
              ? (gpuRaw['driverVersion'] as string).trim() || null
              : null,
        }
      : null,
    memory: {
      totalGb,
      usedGb,
      freeGb,
      cachedGb,
      usagePercent: totalGb > 0 ? round((usedGb / totalGb) * 100) : 0,
      type: memModule?.type || null,
      clockMhz: memModule?.clockSpeed || null,
    },
    storage: disk
      ? {
          name: disk.name?.trim() || disk.device || 'Disco',
          type: disk.type || 'Disk',
          interfaceType: disk.interfaceType || '—',
          sizeGb: storageSizeGb,
          usedGb: storageUsedGb,
          freeGb: storageFreeGb,
          usagePercent:
            storageSizeGb > 0 ? round((storageUsedGb / storageSizeGb) * 100) : 0,
          temperatureC: typeof disk.temperature === 'number' ? round(disk.temperature) : null,
          smartStatus: disk.smartStatus || null,
        }
      : null,
    processes: {
      total: 0,
      running: 0,
      sleeping: 0,
    },
    os: {
      distro: osInfo.distro || 'Windows',
      release: osInfo.release || '—',
      arch: osInfo.arch || '—',
    },
  };
}
