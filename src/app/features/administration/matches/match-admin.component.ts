import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { Team, Matchday, Match, Competition } from '../../../core/api/models';

type AdminTab = 'teams' | 'matchdays';

@Component({
  selector: 'app-match-admin',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    TranslocoModule,
  ],
  templateUrl: './match-admin.component.html',
  styleUrl: './match-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  protected readonly activeTab = signal<AdminTab>('teams');
  protected readonly teams = signal<Team[]>([]);
  protected readonly competitions = signal<Competition[]>([]);
  protected readonly matchdays = signal<Matchday[]>([]);
  protected readonly matches = signal<Match[]>([]);
  protected readonly selectedMatchday = signal<Matchday | null>(null);
  protected readonly selectedCompetitionId = signal<number | null>(null);

  protected readonly showTeamForm = signal(false);
  protected readonly showMatchdayForm = signal(false);
  protected readonly showMatchForm = signal(false);
  protected readonly editingTeam = signal<Team | null>(null);

  protected readonly matchStatuses = ['SCHEDULED', 'LIVE', 'FINISHED', 'CANCELLED'];
  protected readonly matchResultForms = new Map<number, FormGroup>();

  protected teamForm = this.fb.group({
    name: ['', Validators.required],
    shortName: ['', [Validators.required, Validators.maxLength(5)]],
    logoUrl: [''],
  });

  protected matchdayForm = this.fb.group({
    competitionId: [null as number | null, Validators.required],
    number: [1, [Validators.required, Validators.min(1)]],
  });

  protected matchForm = this.fb.group({
    homeTeamId: [null as number | null, Validators.required],
    awayTeamId: [null as number | null, Validators.required],
    kickoffTime: ['', Validators.required],
  });

  private createResultForm(match: Match) {
    return this.fb.group({
      homeGoals: [match.homeGoals ?? null as number | null, Validators.min(0)],
      awayGoals: [match.awayGoals ?? null as number | null, Validators.min(0)],
      status: [match.status ?? 'FINISHED'],
    });
  }

  ngOnInit() {
    this.http.get<Team[]>('/api/teams').subscribe((t) => this.teams.set(t));
    this.http.get<Competition[]>('/api/competitions').subscribe((c) => this.competitions.set(c));
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
  }

  // Teams
  openCreateTeam() { this.editingTeam.set(null); this.teamForm.reset(); this.showTeamForm.set(true); }
  openEditTeam(team: Team) { this.editingTeam.set(team); this.teamForm.patchValue(team); this.showTeamForm.set(true); }
  cancelTeam() { this.showTeamForm.set(false); }

  saveTeam() {
    if (this.teamForm.invalid) return;
    const value = this.teamForm.getRawValue();
    const editing = this.editingTeam();
    const request$ = editing
      ? this.http.patch<Team>(`/api/teams/${editing.id}`, value)
      : this.http.post<Team>('/api/teams', value);
    request$.subscribe({
      next: (saved) => {
        if (!editing) this.teams.update((list) => [...list, saved]);
        else this.teams.update((list) => list.map((t) => (t.id === saved.id ? saved : t)));
        this.showTeamForm.set(false);
        this.snackBar.open(this.transloco.translate('admin.save') + ' ✓', '', { duration: 2000 });
      },
    });
  }

  deleteTeam(id: number) {
    this.http.delete(`/api/teams/${id}`).subscribe(() => {
      this.teams.update((list) => list.filter((t) => t.id !== id));
    });
  }

  // Matchdays
  loadMatchdays(competitionId: number) {
    this.selectedCompetitionId.set(competitionId);
    this.selectedMatchday.set(null);
    this.matches.set([]);
    this.matchResultForms.clear();
    this.http.get<Matchday[]>(`/api/matchdays?competitionId=${competitionId}`).subscribe((m) => this.matchdays.set(m));
  }

  openCreateMatchday() { this.showMatchdayForm.set(true); this.matchdayForm.reset({ number: 1, competitionId: this.selectedCompetitionId() }); }
  cancelMatchday() { this.showMatchdayForm.set(false); }

  saveMatchday() {
    if (this.matchdayForm.invalid) return;
    const value = this.matchdayForm.getRawValue();
    this.http.post<Matchday>('/api/matchdays', value).subscribe({
      next: (saved) => {
        this.matchdays.update((list) => [...list, saved]);
        this.showMatchdayForm.set(false);
        this.snackBar.open(this.transloco.translate('admin.save') + ' ✓', '', { duration: 2000 });
      },
    });
  }

  selectMatchday(md: Matchday) {
    this.selectedMatchday.set(md);
    this.http.get<Match[]>(`/api/matchdays/${md.id}/matches`).subscribe((m) => {
      this.matchResultForms.clear();
      m.forEach((match) => this.matchResultForms.set(match.id, this.createResultForm(match)));
      this.matches.set(m);
    });
  }

  // Matches
  openCreateMatch() { this.matchForm.reset(); this.showMatchForm.set(true); }
  cancelMatch() { this.showMatchForm.set(false); }

  saveMatch() {
    if (this.matchForm.invalid || !this.selectedMatchday()) return;
    const value = this.matchForm.getRawValue();
    const md = this.selectedMatchday()!;
    this.http.post<Match>(`/api/matchdays/${md.id}/matches`, value).subscribe({
      next: (saved) => {
        this.matches.update((list) => [...list, saved]);
        this.showMatchForm.set(false);
        this.snackBar.open(this.transloco.translate('admin.save') + ' ✓', '', { duration: 2000 });
      },
    });
  }

  saveMatchResult(match: Match, form: FormGroup) {
    const value = form.getRawValue();
    this.http.patch<Match>(`/api/matches/${match.id}`, value).subscribe({
      next: (saved) => {
        this.matches.update((list) => list.map((m) => (m.id === saved.id ? saved : m)));
        this.snackBar.open(this.transloco.translate('admin.save') + ' ✓', '', { duration: 2000 });
      },
    });
  }

  formatKickoff(time: string): string {
    return new Intl.DateTimeFormat('default', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(time));
  }
}
