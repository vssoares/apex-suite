import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

/** Fallbacks for Material Symbols names that don't exist as Material Icons Outline. */
const ICON_ALIASES: Record<string, string> = {
  memory_alt: 'matMemoryOutline',
  hard_drive: 'matStorageOutline',
  device_reset: 'matSettingsBackupRestoreOutline',
};

function toMaterialIconName(name: string): string {
  if (ICON_ALIASES[name]) {
    return ICON_ALIASES[name];
  }

  if (name.startsWith('mat')) {
    return name;
  }

  const pascal = name
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return `mat${pascal}Outline`;
}

@Component({
  selector: 'app-icon',
  imports: [NgIcon],
  template: `<ng-icon [name]="resolvedName()" [size]="sizePx()" />`,
  host: {
    '[class.primary]': 'color() === "primary"',
    '[class.emerald]': 'color() === "emerald"',
    '[class.sky]': 'color() === "sky"',
    '[class.purple]': 'color() === "purple"',
    '[class.amber]': 'color() === "amber"',
    '[class.muted]': 'color() === "muted"',
    '[class.error]': 'color() === "error"',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      color: inherit;
    }
    :host(.primary) {
      color: var(--primary);
    }
    :host(.emerald) {
      color: var(--emerald);
    }
    :host(.sky) {
      color: var(--sky);
    }
    :host(.purple) {
      color: var(--purple);
    }
    :host(.amber) {
      color: var(--amber);
    }
    :host(.muted) {
      color: var(--on-surface-variant);
    }
    :host(.error) {
      color: var(--error);
    }
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(18);
  readonly color = input<
    'default' | 'primary' | 'emerald' | 'sky' | 'purple' | 'amber' | 'muted' | 'error'
  >('default');

  protected readonly resolvedName = computed(() => toMaterialIconName(this.name()));
  protected readonly sizePx = computed(() => `${this.size()}px`);
}
