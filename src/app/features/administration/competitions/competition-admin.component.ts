import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { Competition, ScoringRule } from '../../../core/api/models';

@Component({
  selector: 'app-competition-admin',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslocoModule,
  ],
  templateUrl: './competition-admin.component.html',
  styleUrl: './competition-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  protected readonly competitions = signal<Competition[]>([]);
  protected readonly selectedCompetition = signal<Competition | null>(null);
  protected readonly scoringRule = signal<ScoringRule | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editMode = signal(false);

  protected readonly statuses = ['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'];

  protected form = this.fb.group({
    name: ['', Validators.required],
    season: ['', Validators.required],
    startDate: [''],
    endDate: [''],
    status: ['DRAFT'],
  });

  protected scoringForm = this.fb.group({
    exactResultPoints: [5, [Validators.required, Validators.min(0)]],
    goalDifferencePoints: [3, [Validators.required, Validators.min(0)]],
    tendencyPoints: [2, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.loadCompetitions();
  }

  private loadCompetitions() {
    this.http.get<Competition[]>('/api/competitions').subscribe((c) => this.competitions.set(c));
  }

  openCreate() {
    this.editMode.set(false);
    this.form.reset({ status: 'DRAFT' });
    this.showForm.set(true);
  }

  openEdit(competition: Competition) {
    this.editMode.set(true);
    this.form.patchValue(competition);
    this.selectedCompetition.set(competition);
    this.showForm.set(true);
    this.http.get<ScoringRule>(`/api/competitions/${competition.id}/scoring-rules`).subscribe((r) => {
      this.scoringRule.set(r);
      this.scoringForm.patchValue(r);
    });
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const comp = this.selectedCompetition();
    const request$ = this.editMode() && comp
      ? this.http.patch<Competition>(`/api/competitions/${comp.id}`, value)
      : this.http.post<Competition>('/api/competitions', value);

    request$.subscribe({
      next: (saved) => {
        if (!this.editMode()) {
          this.competitions.update((list) => [...list, saved]);
        } else {
          this.competitions.update((list) => list.map((c) => (c.id === saved.id ? saved : c)));
        }
        this.showForm.set(false);
        const msg = this.transloco.translate('admin.save');
        this.snackBar.open(msg + ' ✓', '', { duration: 2000 });

        if (this.editMode() && comp) {
          this.saveScoringRules(comp.id);
        }
      },
    });
  }

  private saveScoringRules(competitionId: number) {
    const value = this.scoringForm.getRawValue();
    this.http.put(`/api/competitions/${competitionId}/scoring-rules`, {
      competitionId,
      ...value,
    }).subscribe();
  }

  cancel() {
    this.showForm.set(false);
    this.selectedCompetition.set(null);
  }
}
