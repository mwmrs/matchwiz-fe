import { ApplicationConfig, provideAppInitializer, inject, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { TranslocoHttpLoader } from './core/services/transloco-loader';
import { AuthStore } from './core/auth/auth.store';
import { ApiConfiguration } from './core/api/api-configuration';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: ApiConfiguration,
      useFactory: () => {
        const baseHref =
          inject(DOCUMENT).querySelector('base')?.getAttribute('href') ?? '/';
        const config = new ApiConfiguration();
        config.rootUrl = `${baseHref}api`;
        return config;
      },
    },
    provideTransloco({
      config: {
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => {
      const authStore = inject(AuthStore);
      return authStore.initializeSession();
    }),
  ],
};
