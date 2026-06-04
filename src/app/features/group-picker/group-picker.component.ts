import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';
import type { Group, GroupMembership } from '../../core/api/models';

@Component({
  selector: 'app-group-picker',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslocoModule],
  templateUrl: './group-picker.component.html',
  styleUrl: './group-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupPickerComponent implements OnInit {
  readonly target = input.required<string>();

  private readonly http = inject(HttpClient);

  protected readonly loading = signal(true);
  protected readonly allGroups = signal<Group[]>([]);
  protected readonly memberships = signal<GroupMembership[]>([]);

  protected readonly myGroups = computed(() => {
    const approved = new Set(
      this.memberships().filter((m) => m.approved).map((m) => m.groupId),
    );
    return this.allGroups().filter((g) => approved.has(g.id));
  });

  protected readonly titleKey = computed(() =>
    this.target() === 'rankings' ? 'groupPicker.rankingsTitle' : 'groupPicker.predictionsTitle',
  );

  ngOnInit() {
    forkJoin({
      memberships: this.http.get<GroupMembership[]>('/api/users/me/memberships'),
      groups: this.http.get<Group[]>('/api/groups'),
    }).subscribe({
      next: ({ memberships, groups }) => {
        this.memberships.set(memberships);
        this.allGroups.set(groups);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected groupLink(groupId: number): (string | number)[] {
    return this.target() === 'rankings'
      ? ['/rankings', groupId]
      : ['/predictions', 'group', groupId];
  }
}
