import { inject, Injectable, effect, signal, DestroyRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthStore } from '../auth/auth.store';
import type { Theme } from '../api/models';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly authStore = inject(AuthStore);
  private readonly document = inject(DOCUMENT);
  private readonly prefersDark = signal(
    this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? true
  );

  constructor() {
    const mq = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => this.prefersDark.set(e.matches);
    mq?.addEventListener('change', handler);
    inject(DestroyRef).onDestroy(() => mq?.removeEventListener('change', handler));

    effect(() => this.apply(this.authStore.user()?.theme ?? 'DARK'));
  }

  private apply(theme: Theme): void {
    const isDark = theme === 'DARK' || (theme === 'SYSTEM' && this.prefersDark());
    this.document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}
