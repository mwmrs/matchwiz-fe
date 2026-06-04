import { ApplicationConfig, provideAppInitializer, inject, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { TranslocoHttpLoader } from './core/services/transloco-loader';
import { AuthStore } from './core/auth/auth.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(async () => {
      const authStore = inject(AuthStore);
      const transloco = inject(TranslocoService);
      await authStore.initializeSession();
      const lang = authStore.user()?.preferredLanguage;
      if (lang) transloco.setActiveLang(lang);
    }),
  ],
};
