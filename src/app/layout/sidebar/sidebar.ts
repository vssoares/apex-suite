import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/ui/icon/icon';
import { StatusDot } from '../../shared/ui/status-dot/status-dot';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon, StatusDot],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: {
    style: 'display: contents',
  },
})
export class Sidebar {
  readonly navItems: NavItem[] = [
    { path: '/game-booster', label: 'Game Booster', icon: 'rocket_launch' },
    { path: '/display-cores', label: 'Display & Cores', icon: 'monitor' },
    { path: '/perfis-de-jogos', label: 'Perfis de Jogos', icon: 'sports_esports' },
    { path: '/configuracoes', label: 'Configurações', icon: 'tune' },
  ];
}
