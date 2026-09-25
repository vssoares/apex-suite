import { Component, input } from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { Panel } from '../../../../shared/ui/panel/panel';

@Component({
  selector: 'app-game-card',
  imports: [Button, Panel],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
})
export class GameCard {
  readonly title = input.required<string>();
  readonly version = input('');
  readonly tag = input('');
  readonly imageUrl = input('');
  readonly leftLabel = input('FPS Médio');
  readonly leftValue = input('');
  readonly leftUnit = input('FPS');
  readonly rightLabel = input('');
  readonly rightValue = input('');
  readonly rightUnit = input('');
  readonly rightTone = input<'default' | 'success'>('default');
  readonly metaLeft = input('');
  readonly metaRight = input('');
}
