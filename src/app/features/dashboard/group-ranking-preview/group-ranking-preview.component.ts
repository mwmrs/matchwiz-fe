import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthStore } from '../../../core/auth/auth.store';
import type { RankingEntry } from '../../../core/api/models';

@Component({
  selector: 'app-group-ranking-preview',
  imports: [MatIconModule, TranslocoModule],
  templateUrl: './group-ranking-preview.component.html',
  styleUrl: './group-ranking-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupRankingPreviewComponent implements OnInit {
  readonly groupId = input.required<number>();

  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);

  protected readonly rankings = signal<RankingEntry[]>([]);
  protected readonly loading = signal(true);

  protected readonly topRankings = computed(() => this.rankings().slice(0, 10));

  ngOnInit(): void {
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
