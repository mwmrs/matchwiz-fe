import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import { MatchdayFilterComponent } from './matchday-filter.component';
import type { Group, Matchday, RankingEntry, ScoringRule } from '../../core/api/models';

@Component({
  selector: 'app-ranking',
  imports: [RouterLink, MatButtonModule, MatTableModule, MatProgressSpinnerModule, MatIconModule, MatTooltipModule, TranslocoModule, MatchdayFilterComponent],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingComponent implements OnInit {
  readonly groupId = input.required<string>();

  private readonly http = inject(HttpClient);
  protected readonly authStore = inject(AuthStore);

  protected readonly rankings = signal<RankingEntry[]>([]);
  protected readonly scoringRule = signal<ScoringRule | null>(null);
  protected readonly loading = signal(true);
  protected readonly matchdays = signal<Matchday[]>([]);
  protected readonly filteredRankings = signal<RankingEntry[] | null>(null);

  protected readonly displayedRankings = computed(() => this.filteredRankings() ?? this.rankings());

  protected readonly displayedColumns = ['rank', 'player', 'points', 'exact', 'goalDiff', 'tendency', 'bonus'];

  ngOnInit() {
    const id = this.groupId();
    forkJoin({
      rankings: this.http.get<RankingEntry[]>(`/api/groups/${id}/rankings`),
      group: this.http.get<Group>(`/api/groups/${id}`),
    }).pipe(
      switchMap(({ rankings, group }) =>
        forkJoin({
          scoringRule: this.http.get<ScoringRule>(`/api/competitions/${group.competitionId}/scoring-rules`),
          matchdays: this.http.get<Matchday[]>(`/api/matchdays`, { params: { competitionId: group.competitionId } }),
        }).pipe(map(rest => ({ rankings, ...rest })))
      )
    ).subscribe({
      next: ({ rankings, scoringRule, matchdays }) => {
        this.rankings.set(rankings);
        this.scoringRule.set(scoringRule);
        this.matchdays.set(matchdays);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected isCurrentUser(userId: number): boolean {
    return this.authStore.currentUserId() === userId;
  }
}
