import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import * as materialIcons from '@ng-icons/material-icons/outline';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideIcons(materialIcons),
    provideNgIconsConfig({
      size: '1.125rem',
    }),
  ],
};
