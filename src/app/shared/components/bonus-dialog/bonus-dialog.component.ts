import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { GroupMembership, ManualBonus } from '../../../core/api/models';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-bonus-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslocoModule,
  ],
  template: `
    <ng-container *transloco="let t">
      <h2 mat-dialog-title>{{ data.member.username }}</h2>
      <mat-dialog-content>
        <form [formGroup]="form" (ngSubmit)="award()" class="bonus-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ t('admin.bonusPoints') }}</mat-label>
            <input matInput type="number" min="1" formControlName="points" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ t('admin.bonusReason') }}</mat-label>
            <input matInput formControlName="reason" />
          </mat-form-field>
          <button mat-flat-button type="submit" [disabled]="form.invalid">
            {{ t('admin.awardBonus') }}
          </button>
        </form>

        <div class="bonus-list">
          @if (loading()) {
            <mat-spinner diameter="32" />
          } @else if (bonuses().length === 0) {
            <p class="no-bonuses">{{ t('admin.noBonuses') }}</p>
          } @else {
            @for (bonus of bonuses(); track bonus.id) {
              <div class="bonus-item">
                <div class="bonus-info">
                  <span class="bonus-points">+{{ bonus.points }}</span>
                  @if (bonus.reason) {
                    <span class="bonus-reason">{{ bonus.reason }}</span>
                  }
                  <span class="bonus-meta">{{ t('admin.awardedBy') }}: {{ bonus.awardedBy }}</span>
                </div>
                <button mat-icon-button (click)="removeBonus(bonus)" [attr.aria-label]="t('admin.delete')">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>{{ t('common.close') }}</button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: `
    .bonus-form {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 320px;
      padding-top: 0.5rem;
    }

    .bonus-list {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .no-bonuses {
      color: var(--mw-text-muted);
      font-size: 0.875rem;
      margin: 0;
    }

    .bonus-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      border-radius: var(--mw-radius-lg, 8px);
      background: var(--mw-surface);
    }

    .bonus-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .bonus-points {
      font-weight: 600;
    }

    .bonus-reason {
      font-size: 0.875rem;
    }

    .bonus-meta {
      font-size: 0.75rem;
      color: var(--mw-text-muted);
    }

    mat-spinner {
      margin: 1rem auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BonusDialogComponent implements OnInit {
  protected readonly data = inject<{ member: GroupMembership; groupId: number }>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<BonusDialogComponent>);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly transloco = inject(TranslocoService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  protected readonly bonuses = signal<ManualBonus[]>([]);
  protected readonly loading = signal(true);

  protected readonly form = this.fb.group({
    points: [null as number | null, [Validators.required, Validators.min(1)]],
    reason: [''],
  });

  ngOnInit() {
    this.loadBonuses();
  }

  private loadBonuses() {
    this.loading.set(true);
    this.http.get<ManualBonus[]>(`/api/groups/${this.data.groupId}/manual-bonuses`).subscribe({
      next: (all) => {
        this.bonuses.set(all.filter((b) => b.userId === this.data.member.userId));
        this.loading.set(false);
      },
    });
  }

  award() {
    if (this.form.invalid) return;
    const { points, reason } = this.form.getRawValue();
    const body = { userId: this.data.member.userId, points: points!, ...(reason ? { reason } : {}) };

    this.http.post<ManualBonus>(`/api/groups/${this.data.groupId}/manual-bonuses`, body).subscribe({
      next: () => {
        this.snackBar.open(this.transloco.translate('admin.bonusAwarded'), '', { duration: 2000 });
        this.dialogRef.close();
      },
    });
  }

  removeBonus(bonus: ManualBonus) {
    const message = this.transloco.translate('admin.removeBonusConfirm');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message },
      width: '360px',
      panelClass: 'mw-dialog',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.http.delete(`/api/groups/${this.data.groupId}/manual-bonuses/${bonus.id}`).subscribe({
        next: () => {
          this.bonuses.update((list) => list.filter((b) => b.id !== bonus.id));
        },
      });
    });
  }
}
