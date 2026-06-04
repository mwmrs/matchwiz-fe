import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import { NotificationStore } from '../../core/services/notification.store';
import type { Group, Competition, Matchday, Notification, GroupMembership } from '../../core/api/models';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    TranslocoModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  protected readonly authStore = inject(AuthStore);
  protected readonly notificationStore = inject(NotificationStore);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  protected readonly allGroups = signal<Group[]>([]);
  protected readonly memberships = signal<GroupMembership[]>([]);
  protected readonly competition = signal<Competition | null>(null);
  protected readonly upcomingMatchday = signal<Matchday | null>(null);
  protected readonly missingPredictionsCount = signal(0);

  protected readonly myGroups = computed(() => {
    const approved = new Set(
      this.memberships().filter((m) => m.approved).map((m) => m.groupId),
    );
    return this.allGroups().filter((g) => approved.has(g.id));
  });

  protected readonly pendingGroups = computed(() => {
    const pending = new Set(
      this.memberships().filter((m) => !m.approved).map((m) => m.groupId),
    );
    return this.allGroups().filter((g) => pending.has(g.id));
  });

  protected readonly availableGroups = computed(() => {
    const joined = new Set(this.memberships().map((m) => m.groupId));
    return this.allGroups().filter((g) => !joined.has(g.id));
  });

  ngOnInit() {
    this.notificationStore.load(undefined);
    this.http.get<GroupMembership[]>('/api/users/me/memberships').subscribe((m) => this.memberships.set(m));
    this.http.get<Group[]>('/api/groups').subscribe((g) => this.allGroups.set(g));
    this.http.get<Competition[]>('/api/competitions').subscribe((comps) => {
      const active = comps.find((c) => c.status === 'ACTIVE') ?? comps[0];
      if (active) {
        this.competition.set(active);
        this.http.get<Matchday[]>(`/api/matchdays?competitionId=${active.id}`).subscribe((mds) => {
          const sorted = mds.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
          const upcoming = sorted.find((md) => new Date(md.deadline) > new Date()) ?? sorted[sorted.length - 1];
          if (upcoming) {
            this.upcomingMatchday.set(upcoming);
            this.http.get<unknown[]>(`/api/matchdays/${upcoming.id}/matches`).subscribe((matches) => {
              this.http.get<unknown[]>(`/api/matchdays/${upcoming.id}/predictions`).subscribe((preds) => {
                this.missingPredictionsCount.set(matches.length - preds.length);
              });
            });
          }
        });
      }
    });
  }

  protected joinGroup(groupId: number) {
    this.http.post<GroupMembership>(`/api/groups/${groupId}/join`, {}).subscribe({
      next: (membership) => {
        this.memberships.update((list) => [...list, membership]);
        const msg = this.transloco.translate('dashboard.joinRequestSent');
        this.snackBar.open(msg, '', { duration: 3000 });
      },
    });
  }

  protected getUnreadNotifications(): Notification[] {
    return this.notificationStore.notifications().filter((n) => !n.read).slice(0, 5);
  }

  protected markRead(id: number) {
    this.notificationStore.markRead(id);
  }

  protected formatDeadline(deadline: string): string {
    return new Intl.DateTimeFormat('default', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(deadline));
  }
}
