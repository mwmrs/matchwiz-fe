import { inject, Injectable, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthStore } from '../auth/auth.store';
import type { Theme } from '../api/models';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly authStore = inject(AuthStore);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => this.apply(this.authStore.user()?.theme ?? 'DARK'));
  }

  private apply(theme: Theme): void {
    const prefersDark =
      this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? true;
    const isDark = theme === 'DARK' || (theme === 'SYSTEM' && prefersDark);
    this.document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}
