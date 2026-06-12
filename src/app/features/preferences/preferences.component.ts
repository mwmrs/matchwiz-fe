import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import type { UpdateUserRequest, User } from '../../core/api/models';

@Component({
  selector: 'app-preferences',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    TranslocoModule,
  ],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  protected readonly authStore = inject(AuthStore);

  protected readonly saving = signal(false);

  protected readonly languages = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
  ];

  protected readonly themes = [
    { value: 'LIGHT', labelKey: 'preferences.themeLight' },
    { value: 'DARK', labelKey: 'preferences.themeDark' },
    { value: 'SYSTEM', labelKey: 'preferences.themeSystem' },
  ];

  protected readonly timezones = Intl.supportedValuesOf
    ? Intl.supportedValuesOf('timeZone')
    : ['Europe/Berlin', 'Europe/London', 'America/New_York', 'UTC'];

  protected form = this.fb.group({
    email: ['', Validators.email],
    preferredLanguage: ['de'],
    timezone: ['Europe/Berlin'],
    theme: ['DARK'],
    emailNotifications: [{ value: false, disabled: true }],
    matchdayReminders: [{ value: false, disabled: true }],
    twoFactorEnabled: [{ value: false, disabled: true }],
  });

  ngOnInit() {
    const user = this.authStore.user();
    if (user) {
      this.form.patchValue({
        email: user.email ?? '',
        preferredLanguage: user.preferredLanguage ?? 'en',
        timezone: user.timezone ?? 'Europe/Berlin',
        theme: user.theme ?? 'DARK',
        emailNotifications: user.emailNotifications ?? false,
        matchdayReminders: user.matchdayReminders ?? true,
        twoFactorEnabled: user.twoFactorEnabled ?? false,
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload: UpdateUserRequest = {
      email: value.email ?? undefined,
      preferredLanguage: value.preferredLanguage ?? undefined,
      timezone: value.timezone ?? undefined,
      theme: (value.theme as UpdateUserRequest['theme']) ?? undefined,
      emailNotifications: value.emailNotifications ?? undefined,
      matchdayReminders: value.matchdayReminders ?? undefined,
      twoFactorEnabled: value.twoFactorEnabled ?? undefined,
    };

    this.http.patch('/api/users/me', payload).subscribe({
      next: () => {
        this.saving.set(false);
        const currentUser = this.authStore.user();
        if (currentUser) {
          this.authStore.setUser({
            ...currentUser,
            email: value.email ?? currentUser.email,
            preferredLanguage: value.preferredLanguage ?? currentUser.preferredLanguage,
            timezone: value.timezone ?? currentUser.timezone,
            theme: (value.theme as User['theme']) ?? currentUser.theme,
            emailNotifications: value.emailNotifications ?? currentUser.emailNotifications,
            matchdayReminders: value.matchdayReminders ?? currentUser.matchdayReminders,
            twoFactorEnabled: value.twoFactorEnabled ?? currentUser.twoFactorEnabled,
          });
        }
        if (value.preferredLanguage) {
          this.transloco.setActiveLang(value.preferredLanguage);
        }
        const msg = this.transloco.translate('preferences.saved');
        this.snackBar.open(msg, '', { duration: 3000, panelClass: 'snack-success' });
      },
      error: () => this.saving.set(false),
    });
  }
}
