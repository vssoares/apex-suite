import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppUpdate } from '../../core/app-update';
import { DisplayColor } from '../../core/display-color';
import { Icon } from '../../shared/ui/icon/icon';
import type { RecentProfileEntry } from '../../../types/electron';

interface NavItem {
  id: string;
  label: string;
  path?: string;
  badge?: string;
}

@Component({
  selector: 'app-titlebar',
  imports: [Icon, RouterLink, RouterLinkActive],
  templateUrl: './titlebar.html',
  styleUrl: './titlebar.scss',
})
export class Titlebar {
  private readonly displayColor = inject(DisplayColor);
  private readonly destroyRef = inject(DestroyRef);
  readonly update = inject(AppUpdate);

  readonly menuOpen = signal(false);
  readonly recentProfiles = signal<RecentProfileEntry[]>([]);

  /** Tabs do Color+ — Manual e Perfis navegam; demais reservados. */
  readonly navItems: NavItem[] = [
    { id: 'manual', label: 'Manual', path: '/display-cores' },
    { id: 'perfis', label: 'Perfis', path: '/perfis-de-jogos' },
    { id: 'comunidade', label: 'Comunidade', badge: 'Em breve' },
  ];

  readonly activeLabel = computed(
    () => this.displayColor.activePreset()?.title ?? 'Padrão',
  );

  readonly activeInitial = computed(() => {
    const label = this.activeLabel().trim();
    return (label.charAt(0) || 'P').toUpperCase();
  });

  readonly activeProfileId = computed(() => this.displayColor.settings().profileId);

  constructor() {
    void this.refreshRecent();
    const off = window.electronAPI?.onProfileApply?.(() => {
      void this.refreshRecent();
    });
    if (off) this.destroyRef.onDestroy(off);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
  }

  minimize(): void {
    window.electronAPI?.minimize();
  }

  maximize(): void {
    window.electronAPI?.maximize();
  }

  close(): void {
    window.electronAPI?.close();
  }

  installUpdate(): void {
    void this.update.downloadAndInstall();
  }

  async toggleProfileMenu(event: Event): Promise<void> {
    event.stopPropagation();
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    if (next) await this.refreshRecent();
  }

  keepMenu(event: Event): void {
    event.stopPropagation();
  }

  selectProfile(id: string, event: Event): void {
    event.stopPropagation();
    const preset = this.displayColor.presets().find((p) => p.id === id);
    if (preset) {
      this.displayColor.applyPreset(preset);
    }
    this.menuOpen.set(false);
    void this.refreshRecent();
  }

  private async refreshRecent(): Promise<void> {
    const api = window.electronAPI;
    if (api?.listRecentProfiles) {
      try {
        const list = await api.listRecentProfiles();
        this.recentProfiles.set(list);
        return;
      } catch {
        // fallback abaixo
      }
    }

    this.recentProfiles.set(
      this.displayColor
        .presets()
        .slice(0, 4)
        .map((p) => ({
          id: p.id,
          title: p.title,
          shortTitle: p.title.length > 22 ? `${p.title.slice(0, 20)}…` : p.title,
        })),
    );
  }
}
