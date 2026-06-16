import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import type { Group, Match, Matchday, Prediction } from '../../core/api/models';

interface PredictionRow {
  matchdayNumber: number;
  homeTeamShortName: string;
  homeTeamLogoUrl: string | undefined;
  awayTeamShortName: string;
  awayTeamLogoUrl: string | undefined;
  homeGoals: number | null;
  awayGoals: number | null;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  awardedPoints: number | undefined;
}

@Component({
  selector: 'app-member-predictions',
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule, MatIconModule, TranslocoModule],
  templateUrl: './member-predictions.component.html',
  styleUrl: './member-predictions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberPredictionsComponent implements OnInit {
  readonly groupId = input.required<string>();
  readonly userId = input.required<string>();
  readonly username = input<string>('');

  private readonly http = inject(HttpClient);

  protected readonly rows = signal<PredictionRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  ngOnInit() {
    const groupId = this.groupId();
    const userId = +this.userId();

    this.http.get<Group>(`/api/groups/${groupId}`).pipe(
      switchMap(group =>
        this.http.get<Matchday[]>(`/api/matchdays?competitionId=${group.competitionId}`)
      ),
      switchMap(matchdays =>
        forkJoin(
          matchdays.map(matchday =>
            forkJoin({
              matches: this.http.get<Match[]>(`/api/matchdays/${matchday.id}/matches`),
              predictions: this.http.get<Prediction[]>(
                `/api/matchdays/${matchday.id}/predictions?groupId=${groupId}&userId=${userId}`
              ),
            }).pipe(map(({ matches, predictions }) => ({ matchday, matches, predictions })))
          )
        )
      ),
      map(results => {
        const rows: PredictionRow[] = [];
        for (const { matchday, matches, predictions } of results) {
          for (const match of matches) {
            if (match.status !== 'FINISHED') continue;
            const prediction = predictions.find(p => p.matchId === match.id);
            if (!prediction) continue;
            rows.push({
              matchdayNumber: matchday.number,
              homeTeamShortName: match.homeTeam?.shortName ?? '',
              homeTeamLogoUrl: match.homeTeam?.logoUrl,
              awayTeamShortName: match.awayTeam?.shortName ?? '',
              awayTeamLogoUrl: match.awayTeam?.logoUrl,
              homeGoals: match.homeGoals ?? null,
              awayGoals: match.awayGoals ?? null,
              predictedHomeGoals: prediction.predictedHomeGoals,
              predictedAwayGoals: prediction.predictedAwayGoals,
              awardedPoints: prediction.awardedPoints,
            });
          }
        }
        return rows.sort((a, b) => a.matchdayNumber - b.matchdayNumber);
      })
    ).subscribe({
      next: rows => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
