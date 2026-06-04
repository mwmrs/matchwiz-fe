import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';
import type { Match, Matchday, Prediction } from '../../core/api/models';

@Component({
  selector: 'app-matchday-prediction',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslocoModule,
  ],
  templateUrl: './matchday-prediction.component.html',
  styleUrl: './matchday-prediction.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchdayPredictionComponent implements OnInit {
  readonly matchdayId = input.required<string>();

  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  protected readonly matchday = signal<Matchday | null>(null);
  protected readonly matches = signal<Match[]>([]);
  protected readonly predictions = signal<Prediction[]>([]);
  protected readonly saving = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected form!: FormGroup;

  protected readonly now = signal(new Date());

  ngOnInit() {
    const id = Number(this.matchdayId());
    this.loading.set(true);
    this.error.set(false);

    forkJoin({
      matchday: this.http.get<Matchday>(`/api/matchdays/${id}`),
      matches: this.http.get<Match[]>(`/api/matchdays/${id}/matches`),
      predictions: this.http.get<Prediction[]>(`/api/matchdays/${id}/predictions`),
    }).subscribe({
      next: ({ matchday, matches, predictions }) => {
        this.matchday.set(matchday);
        this.matches.set(matches);
        this.predictions.set(predictions);
        this.buildForm(matches, predictions);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private buildForm(matches: Match[], predictions: Prediction[]) {
    const controls: Record<string, FormGroup> = {};
    for (const match of matches) {
      const pred = predictions.find((p) => p.matchId === match.id);
      controls[`match_${match.id}`] = this.fb.group({
        home: [pred?.predictedHomeGoals ?? ''],
        away: [pred?.predictedAwayGoals ?? ''],
      });
    }
    this.form = this.fb.group(controls);
  }

  protected isLocked(match: Match): boolean {
    return new Date(match.kickoffTime) <= this.now();
  }

  protected getMatchGroup(matchId: number): FormGroup {
    return this.form?.get(`match_${matchId}`) as FormGroup;
  }

  submit() {
    if (!this.form) return;
    this.saving.set(true);
    const id = Number(this.matchdayId());
    const payload = this.matches()
      .filter((m) => !this.isLocked(m))
      .map((m) => {
        const group = this.getMatchGroup(m.id);
        return {
          matchId: m.id,
          predictedHomeGoals: Number(group.get('home')?.value ?? 0),
          predictedAwayGoals: Number(group.get('away')?.value ?? 0),
        };
      })
      .filter((p) => p.predictedHomeGoals !== null && p.predictedAwayGoals !== null);

    this.http.post<Prediction[]>(`/api/matchdays/${id}/predictions`, payload).subscribe({
      next: () => {
        this.saving.set(false);
        const msg = this.transloco.translate('predictions.submitted');
        this.snackBar.open(msg, '', { duration: 3000, panelClass: 'snack-success' });
      },
      error: () => this.saving.set(false),
    });
  }

  protected formatKickoff(time: string): string {
    return new Intl.DateTimeFormat('default', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(time));
  }
}
