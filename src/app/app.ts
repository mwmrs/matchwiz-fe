import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { AuthStore } from './core/auth/auth.store';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly authStore = inject(AuthStore);
  private readonly transloco = inject(TranslocoService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    effect(() => {
      const lang = this.authStore.user()?.preferredLanguage;
      if (lang) this.transloco.setActiveLang(lang);
    });
  }
}
