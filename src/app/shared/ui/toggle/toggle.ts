import { Component, model } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <label class="toggle">
      <input
        type="checkbox"
        [checked]="checked()"
        (change)="checked.set($any($event.target).checked)"
      />
      <span class="track"></span>
    </label>
  `,
  styles: `
    .toggle {
      position: relative;
      display: inline-flex;
      cursor: pointer;
    }
    input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
    .track {
      width: 2.25rem;
      height: 1.25rem;
      border-radius: var(--radius-full);
      background: var(--surface-highest);
      border: 1px solid var(--outline-variant);
      position: relative;
      transition: background 0.15s ease;
    }
    .track::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 1rem;
      height: 1rem;
      border-radius: var(--radius-full);
      background: #fff;
      transition: transform 0.15s ease;
    }
    input:checked + .track {
      background: var(--primary-strong);
      border-color: var(--primary-strong);
    }
    input:checked + .track::after {
      transform: translateX(1rem);
    }
  `,
})
export class Toggle {
  readonly checked = model(true);
}
