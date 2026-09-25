import { Component, input } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';

export interface SpecItem {
  label: string;
  value: string;
  detail: string;
  detailTone?: 'primary' | 'success' | 'muted';
  icon?: string;
}

@Component({
  selector: 'app-spec-strip',
  imports: [Icon],
  templateUrl: './spec-strip.html',
  styleUrl: './spec-strip.scss',
})
export class SpecStrip {
  readonly specs = input<SpecItem[]>([]);
}
