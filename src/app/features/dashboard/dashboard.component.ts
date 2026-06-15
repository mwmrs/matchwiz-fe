import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import { NotificationStore } from '../../core/services/notification.store';
import type { Group, Competition, Match, Matchday, Notification, GroupMembership, Prediction } from '../../core/api/models';
import { GroupRankingPreviewComponent } from './group-ranking-preview/group-ranking-preview.component';
import { MatchStatusPreviewComponent } from './match-status-preview/match-status-preview.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    TranslocoModule,
    GroupRankingPreviewComponent,
    MatchStatusPreviewComponent,
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
  private readonly allCompetitions = signal<Competition[]>([]);
  protected readonly competition = signal<Competition | null>(null);
  protected readonly allMatchdays = signal<Matchday[]>([]);
  protected readonly allMatches = signal<Match[]>([]);
  protected readonly allPredictions = signal<Prediction[]>([]);

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
    const activeCompIds = new Set(
      this.allCompetitions().filter((c) => c.status === 'ACTIVE').map((c) => c.id),
    );
    return this.allGroups().filter((g) => !joined.has(g.id) && activeCompIds.has(g.competitionId));
  });

  protected readonly targetGroup = computed(() => {
    const comp = this.competition();
    if (!comp) return null;
    return this.myGroups().find((g) => g.competitionId === comp.id) ?? null;
  });

  protected readonly currentMatches = computed(() => {
    const now = new Date();
    const twoHoursAhead = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const threeHoursBefore = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    return this.allMatches().filter((m) => {
      const kickoff = new Date(m.kickoffTime);
      if (m.status === 'LIVE') return true;
      if (m.status === 'SCHEDULED') return kickoff <= twoHoursAhead;
      if (m.status === 'FINISHED') return kickoff >= threeHoursBefore;
      return false;
    });
  });

  protected readonly missingPredictionsCount = computed(() => {
    const now = new Date();
    const predicted = new Set(this.allPredictions().map((p) => p.matchId));
    return this.allMatches().filter(
      (m) => m.status === 'SCHEDULED' && new Date(m.kickoffTime) > now && !predicted.has(m.id),
    ).length;
  });

  constructor() {
    effect(() => {
      const group = this.targetGroup();
      const matchdays = this.allMatchdays();
      if (group && matchdays.length > 0) {
        forkJoin(
          matchdays.map((md) =>
            this.http.get<Prediction[]>(`/api/matchdays/${md.id}/predictions?groupId=${group.id}`),
          ),
        ).subscribe((results) => this.allPredictions.set(results.flat()));
      }
    });
  }

  ngOnInit() {
    this.notificationStore.load(undefined);
    forkJoin({
      memberships: this.http.get<GroupMembership[]>('/api/users/me/memberships'),
      groups: this.http.get<Group[]>('/api/groups'),
      competitions: this.http.get<Competition[]>('/api/competitions'),
    }).subscribe(({ memberships, groups, competitions }) => {
      this.memberships.set(memberships);
      this.allGroups.set(groups);
      this.allCompetitions.set(competitions);

      const approved = new Set(memberships.filter((m) => m.approved).map((m) => m.groupId));
      const myCompIds = new Set(groups.filter((g) => approved.has(g.id)).map((g) => g.competitionId));

      const best =
        competitions.find((c) => c.status === 'ACTIVE' && myCompIds.has(c.id)) ??
        competitions.find((c) => c.status === 'ACTIVE') ??
        competitions[0] ??
        null;

      if (best) {
        this.competition.set(best);
        this.http.get<Matchday[]>(`/api/matchdays?competitionId=${best.id}`).subscribe((mds) => {
          const sorted = mds.sort((a, b) => a.number - b.number);
          this.allMatchdays.set(sorted);
          if (sorted.length === 0) return;
          forkJoin(
            sorted.map((md) => this.http.get<Match[]>(`/api/matchdays/${md.id}/matches`)),
          ).subscribe((results) => this.allMatches.set(results.flat()));
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

}
