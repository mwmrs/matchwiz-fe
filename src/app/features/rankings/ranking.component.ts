import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import type { RankingEntry } from '../../core/api/models';

@Component({
  selector: 'app-ranking',
  imports: [MatTableModule, MatProgressSpinnerModule, MatIconModule, TranslocoModule],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingComponent implements OnInit {
  readonly groupId = input.required<string>();

  private readonly http = inject(HttpClient);
  protected readonly authStore = inject(AuthStore);

  protected readonly rankings = signal<RankingEntry[]>([]);
  protected readonly loading = signal(true);

  protected readonly displayedColumns = ['rank', 'player', 'points', 'exact', 'tendency'];

  ngOnInit() {
    this.http.get<RankingEntry[]>(`/api/groups/${this.groupId()}/rankings`).subscribe({
      next: (data) => {
        this.rankings.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected isCurrentUser(userId: number): boolean {
    return this.authStore.currentUserId() === userId;
  }
}
