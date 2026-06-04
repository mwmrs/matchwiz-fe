import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule, MatIconModule, TranslocoModule],
  template: `
    <ng-container *transloco="let t">
      <div class="admin-shell">
        <header class="page-header">
          <h1>{{ t('admin.title') }}</h1>
        </header>
        <nav class="admin-nav">
          <a routerLink="/admin/competitions" routerLinkActive="active" class="admin-tab">
            <mat-icon>emoji_events</mat-icon>
            {{ t('admin.competitions') }}
          </a>
          <a routerLink="/admin/groups" routerLinkActive="active" class="admin-tab">
            <mat-icon>group</mat-icon>
            {{ t('admin.groups') }}
          </a>
          <a routerLink="/admin/matches" routerLinkActive="active" class="admin-tab">
            <mat-icon>sports_soccer</mat-icon>
            {{ t('admin.matches') }}
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="admin-tab">
            <mat-icon>manage_accounts</mat-icon>
            {{ t('admin.users') }}
          </a>
        </nav>
        <div class="admin-content">
          <router-outlet />
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .admin-shell {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--mw-spacing-md);
    }

    .page-header {
      margin-bottom: var(--mw-spacing-md);
      h1 { font-size: 26px; font-weight: 800; }
    }

    .admin-nav {
      display: flex;
      gap: var(--mw-spacing-sm);
      margin-bottom: var(--mw-spacing-lg);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: var(--mw-spacing-sm);
    }

    .admin-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: var(--mw-radius-sm);
      text-decoration: none;
      color: var(--mw-text-muted);
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &.active, &:hover {
        color: var(--mw-accent);
        background: rgba(198, 255, 0, 0.08);
        text-decoration: none;
      }
    }

    .admin-content { margin-top: var(--mw-spacing-md); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {}
