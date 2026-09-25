import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';

import { routes } from './app.routes';
import { APP_ICONS } from './shared/ui/icon/app-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideIcons(APP_ICONS),
    provideNgIconsConfig({
      size: '1.125rem',
    }),
  ],
};
