import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { switchMap } from 'rxjs';
import type { Group, Matchday } from '../../core/api/models';

@Component({
  selector: 'app-matchday-list',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslocoModule],
  templateUrl: './matchday-list.component.html',
  styleUrl: './matchday-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchdayListComponent implements OnInit {
  readonly groupId = input.required<string>();

  private readonly http = inject(HttpClient);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly group = signal<Group | null>(null);
  protected readonly matchdays = signal<Matchday[]>([]);

  ngOnInit() {
    this.http.get<Group>(`/api/groups/${this.groupId()}`).pipe(
      switchMap((group) => {
        this.group.set(group);
        return this.http.get<Matchday[]>(`/api/matchdays?competitionId=${group.competitionId}`);
      }),
    ).subscribe({
      next: (matchdays) => {
        const sorted = [...matchdays].sort((a, b) => a.number - b.number);
        this.matchdays.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
