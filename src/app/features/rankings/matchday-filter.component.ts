import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import type { Matchday, RankingEntry } from '../../core/api/models';

@Component({
  selector: 'app-matchday-filter',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, TranslocoModule],
  template: `
    <ng-container *transloco="let t">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>{{ t('rankings.filterMatchday') }}</mat-label>
        <mat-select [ngModel]="selectedMatchdayId()" (ngModelChange)="onChange($event)">
          <mat-option [value]="0">{{ t('rankings.allMatchdays') }}</mat-option>
          @for (md of matchdays(); track md.id) {
            <mat-option [value]="md.id">{{ t('dashboard.matchday', { number: md.number }) }}</mat-option>
          }
        </mat-select>
        @if (loading()) {
          <mat-spinner matSuffix diameter="16" />
        }
      </mat-form-field>
    </ng-container>
  `,
  styles: [`mat-form-field { min-width: 180px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchdayFilterComponent {
  readonly matchdays = input.required<Matchday[]>();
  readonly groupId = input.required<string>();
  readonly rankingsChange = output<RankingEntry[] | null>();

  private readonly http = inject(HttpClient);
  protected readonly selectedMatchdayId = signal(0);
  protected readonly loading = signal(false);

  protected onChange(matchdayId: number): void {
    this.selectedMatchdayId.set(matchdayId);
    if (!matchdayId) {
      this.rankingsChange.emit(null);
      return;
    }
    this.loading.set(true);
    this.http.get<RankingEntry[]>(`/api/groups/${this.groupId()}/rankings`, { params: { matchdayId } })
      .subscribe({
        next: entries => {
          this.rankingsChange.emit(entries);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
