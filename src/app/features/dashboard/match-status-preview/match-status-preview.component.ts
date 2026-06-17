import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import type { Match } from '../../../core/api/models';

const STATUS_ORDER: Record<string, number> = { LIVE: 0, SCHEDULED: 1, FINISHED: 2 };

@Component({
  selector: 'app-match-status-preview',
  imports: [DatePipe, MatButtonModule, MatIconModule, TranslocoModule],
  templateUrl: './match-status-preview.component.html',
  styleUrl: './match-status-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchStatusPreviewComponent {
  readonly matches = input.required<Match[]>();
  readonly isAdmin = input<boolean>(false);
  readonly editMatch = output<Match>();

  readonly sortedMatches = computed(() =>
    [...this.matches()].sort((a, b) => {
      const orderDiff = (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3);
      if (orderDiff !== 0) return orderDiff;
      return new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime();
    }),
  );
}
