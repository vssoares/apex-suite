/** Formatting helpers for system telemetry readouts. */
export function formatGhz(value: number): string {
  return value > 0 ? value.toFixed(2) : '—';
}

export function formatGb(value: number, digits = 1): string {
  return value > 0 ? value.toFixed(digits) : '0';
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

export function formatTemp(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(value)}°C`;
}

export function formatDriver(version: string | null | undefined): string {
  if (!version) return '—';
  return version.startsWith('v') ? version : `v${version}`;
}
