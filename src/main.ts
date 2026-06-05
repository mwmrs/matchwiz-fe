import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

async function bootstrap() {
  if (isDevMode() && environment.useMocks) {
    const { worker } = await import('./app/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
}

bootstrap();
