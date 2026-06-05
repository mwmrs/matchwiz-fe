import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import { NotificationStore } from '../../core/services/notification.store';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-authenticated-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    TranslocoModule,
  ],
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayoutComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly notificationStore = inject(NotificationStore);

  protected readonly navItems: NavItem[] = [
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard' },
    { path: '/predictions', labelKey: 'nav.predictions', icon: 'sports_soccer' },
    { path: '/rankings', labelKey: 'nav.rankings', icon: 'leaderboard' },
    { path: '/preferences', labelKey: 'nav.profile', icon: 'person' },
  ];

  logout() {
    this.authStore.logout();
  }
}
