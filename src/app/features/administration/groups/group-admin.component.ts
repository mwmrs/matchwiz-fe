import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { Group, Competition, GroupMembership } from '../../../core/api/models';

@Component({
  selector: 'app-group-admin',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    TranslocoModule,
  ],
  templateUrl: './group-admin.component.html',
  styleUrl: './group-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  protected readonly groups = signal<Group[]>([]);
  protected readonly competitions = signal<Competition[]>([]);
  protected readonly selectedGroup = signal<Group | null>(null);
  protected readonly members = signal<GroupMembership[]>([]);
  protected readonly showForm = signal(false);
  protected readonly editMode = signal(false);

  protected form = this.fb.group({
    competitionId: [null as number | null, Validators.required],
    name: ['', Validators.required],
    description: [''],
  });

  protected inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit() {
    this.http.get<Group[]>('/api/groups').subscribe((g) => this.groups.set(g));
    this.http.get<Competition[]>('/api/competitions').subscribe((c) => this.competitions.set(c));
  }

  openCreate() {
    this.editMode.set(false);
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(group: Group) {
    this.editMode.set(true);
    this.form.patchValue(group);
    this.selectedGroup.set(group);
    this.showForm.set(true);
    this.loadMembers(group.id);
  }

  private loadMembers(groupId: number) {
    this.http.get<GroupMembership[]>(`/api/groups/${groupId}/members`).subscribe((m) => this.members.set(m));
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const group = this.selectedGroup();
    const request$ = this.editMode() && group
      ? this.http.patch<Group>(`/api/groups/${group.id}`, value)
      : this.http.post<Group>('/api/groups', value);

    request$.subscribe({
      next: (saved) => {
        if (!this.editMode()) {
          this.groups.update((list) => [...list, saved]);
          this.showForm.set(false);
        } else {
          this.groups.update((list) => list.map((g) => (g.id === saved.id ? saved : g)));
        }
        const msg = this.transloco.translate('admin.save');
        this.snackBar.open(msg + ' ✓', '', { duration: 2000 });
      },
    });
  }

  sendInvitation() {
    if (this.inviteForm.invalid || !this.selectedGroup()) return;
    const group = this.selectedGroup()!;
    const { email } = this.inviteForm.getRawValue();
    this.http.post(`/api/groups/${group.id}/invitations`, { email }).subscribe({
      next: () => {
        this.inviteForm.reset();
        const msg = this.transloco.translate('admin.invitationSent');
        this.snackBar.open(msg, '', { duration: 3000 });
      },
    });
  }

  approveMember(userId: number) {
    const group = this.selectedGroup();
    if (!group) return;
    this.http.post(`/api/groups/${group.id}/members/${userId}/approve`, {}).subscribe({
      next: (updated) => {
        this.members.update((list) => list.map((m) => (m.userId === userId ? (updated as GroupMembership) : m)));
      },
    });
  }

  removeMember(userId: number) {
    const group = this.selectedGroup();
    if (!group) return;
    this.http.delete(`/api/groups/${group.id}/members/${userId}`).subscribe({
      next: () => {
        this.members.update((list) => list.filter((m) => m.userId !== userId));
      },
    });
  }

  cancel() {
    this.showForm.set(false);
    this.selectedGroup.set(null);
  }

  get pendingMembers(): GroupMembership[] {
    return this.members().filter((m) => !m.approved);
  }

  get approvedMembers(): GroupMembership[] {
    return this.members().filter((m) => m.approved);
  }
}
