import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import {
  EMPTY_SYSTEM_SNAPSHOT,
  type SystemSnapshot,
} from './system-info.model';

const POLL_MS = 2500;

@Service()
export class SystemInfo {
  private readonly destroyRef = inject(DestroyRef);
  private readonly snapshotSignal = signal<SystemSnapshot>(EMPTY_SYSTEM_SNAPSHOT);
  private readonly loadingSignal = signal(false);
  private readonly availableSignal = signal(false);
  private timerId: ReturnType<typeof setInterval> | null = null;

  readonly snapshot = this.snapshotSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly available = this.availableSignal.asReadonly();

  readonly cpu = computed(() => this.snapshot().cpu);
  readonly gpu = computed(() => this.snapshot().gpu);
  readonly memory = computed(() => this.snapshot().memory);
  readonly storage = computed(() => this.snapshot().storage);
  readonly processes = computed(() => this.snapshot().processes);

  constructor() {
    void this.refresh();
    this.timerId = setInterval(() => void this.refresh(), POLL_MS);
    this.destroyRef.onDestroy(() => {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    });
  }

  async refresh(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.getSystemSnapshot) {
      this.availableSignal.set(false);
      return;
    }

    this.loadingSignal.set(true);
    try {
      const snapshot = await api.getSystemSnapshot();
      this.snapshotSignal.set(snapshot);
      this.availableSignal.set(true);
    } catch {
      this.availableSignal.set(false);
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
