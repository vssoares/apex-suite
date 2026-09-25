import { DestroyRef, inject, Service, signal } from '@angular/core';

export type UpdateStatus = 'idle' | 'available' | 'downloading' | 'ready' | 'error';

@Service()
export class AppUpdate {
  private readonly destroyRef = inject(DestroyRef);
  private readonly statusSignal = signal<UpdateStatus>('idle');
  private readonly versionSignal = signal<string | null>(null);
  private readonly progressSignal = signal(0);
  private readonly errorSignal = signal('');
  private readonly unsubscribers: Array<() => void> = [];

  readonly status = this.statusSignal.asReadonly();
  readonly pendingVersion = this.versionSignal.asReadonly();
  readonly progress = this.progressSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const off of this.unsubscribers) off();
      this.unsubscribers.length = 0;
    });
    this.init();
  }

  private init(): void {
    const api = window.electronAPI;
    if (!api?.checkForUpdate || !api.onUpdateAvailable) return;

    this.unsubscribers.push(
      api.onUpdateAvailable(({ version }) => {
        this.versionSignal.set(version);
        this.statusSignal.set('available');
      }),
      api.onUpdateProgress(({ percent }) => {
        this.progressSignal.set(percent);
        this.statusSignal.set('downloading');
      }),
      api.onUpdateDownloaded(() => {
        this.progressSignal.set(100);
        this.statusSignal.set('ready');
        void api.installUpdate();
      }),
      api.onUpdateError((message) => {
        this.errorSignal.set(message || 'Falha na atualização');
        this.statusSignal.set('error');
      }),
    );

    setTimeout(() => {
      void api.checkForUpdate()?.catch(() => undefined);
    }, 4000);
  }

  async downloadAndInstall(): Promise<void> {
    const api = window.electronAPI;
    if (!api?.downloadUpdate) return;
    this.statusSignal.set('downloading');
    this.progressSignal.set(0);
    try {
      await api.downloadUpdate();
    } catch (err) {
      this.errorSignal.set((err as Error)?.message || 'Falha ao baixar atualização');
      this.statusSignal.set('error');
    }
  }

  dismiss(): void {
    this.versionSignal.set(null);
    this.statusSignal.set('idle');
    this.errorSignal.set('');
  }
}
