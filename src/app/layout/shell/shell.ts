import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Titlebar } from '../titlebar/titlebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, Titlebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
