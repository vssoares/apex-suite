import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'display-cores' },
      {
        path: 'game-booster',
        loadComponent: () =>
          import('./pages/game-booster/game-booster').then((m) => m.GameBoosterPage),
      },
      {
        path: 'display-cores',
        loadComponent: () =>
          import('./pages/display-cores/display-cores').then((m) => m.DisplayCoresPage),
      },
      {
        path: 'perfis-de-jogos',
        loadComponent: () =>
          import('./pages/game-profiles/game-profiles').then((m) => m.GameProfilesPage),
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsPage),
      },
    ],
  },
];
