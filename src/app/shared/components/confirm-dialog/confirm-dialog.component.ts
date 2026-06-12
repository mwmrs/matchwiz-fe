import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslocoModule],
  styleUrl: './confirm-dialog.component.scss',
  template: `
    <ng-container *transloco="let t">
      <mat-dialog-content>{{ data.message }}</mat-dialog-content>
      <mat-dialog-actions align="center">
        <button mat-stroked-button [mat-dialog-close]="false">{{ t('admin.cancel') }}</button>
        <button mat-flat-button [mat-dialog-close]="true">{{ t('common.confirm') }}</button>
      </mat-dialog-actions>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<{ message: string }>(MAT_DIALOG_DATA);
}
