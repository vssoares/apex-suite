import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dc-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class DisplayCoresHeader {
  readonly title = input('Display & Calibração de Cores');
}
