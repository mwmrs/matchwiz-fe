import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { User } from '../../../core/api/models';

@Component({
  selector: 'app-user-admin',
  imports: [MatButtonModule, MatIconModule, MatSnackBarModule, TranslocoModule],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  protected readonly users = signal<User[]>([]);

  protected readonly pendingUsers = computed(() => this.users().filter((u) => !u.active));
  protected readonly activeUsers = computed(() => this.users().filter((u) => u.active));

  ngOnInit() {
    this.http.get<User[]>('/api/users').subscribe((u) => this.users.set(u));
  }

  approve(userId: number) {
    this.http.post<User>(`/api/users/${userId}/approve`, {}).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === userId ? updated : u)));
        const msg = this.transloco.translate('admin.userApproved');
        this.snackBar.open(msg, '', { duration: 2000 });
      },
    });
  }
}
