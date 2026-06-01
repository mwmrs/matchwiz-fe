import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet],
  template: `
    <div class="public-shell">
      <header class="public-header">
        <div class="logo">
          <span class="logo-icon">⚽</span>
          <span class="logo-text">MatchWiz</span>
        </div>
      </header>
      <main class="public-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .public-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--mw-bg);
    }

    .public-header {
      padding: var(--mw-spacing-md) var(--mw-spacing-md);
      display: flex;
      justify-content: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--mw-spacing-sm);
    }

    .logo-icon {
      font-size: 28px;
    }

    .logo-text {
      font-family: 'Inter', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: var(--mw-accent);
      letter-spacing: -0.5px;
    }

    .public-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--mw-spacing-md);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent {}
