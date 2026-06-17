import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';
import type { Match } from '../../../core/api/models';

const MATCH_STATUSES = ['SCHEDULED', 'LIVE', 'FINISHED', 'CANCELLED'] as const;

@Component({
  selector: 'app-match-edit-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslocoModule,
  ],
  template: `
    <ng-container *transloco="let t">
      <h2 mat-dialog-title>
        {{ match.homeTeam?.shortName ?? '?' }} vs {{ match.awayTeam?.shortName ?? '?' }}
      </h2>
      <mat-dialog-content>
        <form [formGroup]="form" class="match-edit-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ t('admin.status') }}</mat-label>
            <mat-select formControlName="status">
              @for (s of statuses; track s) {
                <mat-option [value]="s">{{ t('match.status.' + s) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <div class="goals-row">
            <mat-form-field appearance="outline">
              <mat-label>{{ t('admin.homeGoals') }}</mat-label>
              <input matInput type="number" min="0" formControlName="homeGoals">
            </mat-form-field>
            <span class="goals-separator">:</span>
            <mat-form-field appearance="outline">
              <mat-label>{{ t('admin.awayGoals') }}</mat-label>
              <input matInput type="number" min="0" formControlName="awayGoals">
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="dialogRef.close()">{{ t('admin.cancel') }}</button>
        <button mat-flat-button (click)="save()" [disabled]="form.invalid">{{ t('admin.save') }}</button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: `
    .match-edit-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 0.5rem;
      min-width: 280px;
    }

    .goals-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      mat-form-field {
        flex: 1;
      }
    }

    .goals-separator {
      font-size: 1.25rem;
      font-weight: 600;
      padding-bottom: 1.25rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchEditDialogComponent {
  protected readonly match = inject<Match>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<MatchEditDialogComponent>);
  private readonly fb = inject(FormBuilder);

  protected readonly statuses = MATCH_STATUSES;

  protected readonly form = this.fb.group({
    status: [this.match.status, Validators.required],
    homeGoals: [this.match.homeGoals ?? null as number | null, Validators.min(0)],
    awayGoals: [this.match.awayGoals ?? null as number | null, Validators.min(0)],
  });

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
