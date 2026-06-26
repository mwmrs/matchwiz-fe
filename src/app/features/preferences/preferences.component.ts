import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/auth/auth.service';
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
    MatProgressSpinnerModule,
    MatIconModule,
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
  private readonly authService = inject(AuthService);
  protected readonly authStore = inject(AuthStore);

  protected readonly saving = signal(false);
  protected readonly verifyStep = signal<'idle' | 'sent' | 'done'>('idle');
  protected readonly verifyLoading = signal(false);
  protected readonly verifyError = signal<string | null>(null);

  protected readonly isVerified = computed(
    () => this.authStore.user()?.emailVerified === true || this.verifyStep() === 'done',
  );

  protected readonly languages = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
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
    emailNotifications: [false],
    matchdayReminders: [false],
    twoFactorEnabled: [{ value: false, disabled: true }],
  });

  protected readonly verifyCodeForm = this.fb.group({
    code: ['', Validators.required],
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
    const currentUser = this.authStore.user();
    const emailChanged = value.email !== (currentUser?.email ?? '');

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
        if (currentUser) {
          this.authStore.setUser({
            ...currentUser,
            email: value.email ?? currentUser.email,
            emailVerified: emailChanged ? false : currentUser.emailVerified,
            preferredLanguage: value.preferredLanguage ?? currentUser.preferredLanguage,
            timezone: value.timezone ?? currentUser.timezone,
            theme: (value.theme as User['theme']) ?? currentUser.theme,
            emailNotifications: value.emailNotifications ?? currentUser.emailNotifications,
            matchdayReminders: value.matchdayReminders ?? currentUser.matchdayReminders,
            twoFactorEnabled: value.twoFactorEnabled ?? currentUser.twoFactorEnabled,
          });
        }
        if (emailChanged) {
          this.verifyStep.set('idle');
          this.verifyError.set(null);
        }
        if (value.preferredLanguage) {
          this.transloco.setActiveLang(value.preferredLanguage);
        }
        this.transloco.selectTranslate('preferences.saved').pipe(take(1)).subscribe(msg => {
          this.snackBar.open(msg, '', { duration: 3000, panelClass: 'snack-success', horizontalPosition: 'center' });
        });
      },
      error: () => this.saving.set(false),
    });
  }

  requestVerification() {
    this.verifyLoading.set(true);
    this.verifyError.set(null);
    this.authService.requestEmailVerification().subscribe({
      next: () => {
        this.verifyLoading.set(false);
        this.verifyStep.set('sent');
        this.verifyCodeForm.reset();
      },
      error: () => {
        this.verifyLoading.set(false);
        this.verifyError.set('common.error');
      },
    });
  }

  confirmVerification() {
    if (this.verifyCodeForm.invalid) return;
    this.verifyLoading.set(true);
    this.verifyError.set(null);
    const code = this.verifyCodeForm.getRawValue().code!;
    this.authService.confirmEmailVerification(code).subscribe({
      next: () => {
        this.authService.getMe().pipe(take(1)).subscribe(user => {
          this.authStore.setUser(user);
          this.verifyLoading.set(false);
          this.verifyStep.set('done');
        });
      },
      error: (err: { status?: number }) => {
        this.verifyLoading.set(false);
        this.verifyError.set(err.status === 400 ? 'preferences.verifyInvalidCode' : 'common.error');
      },
    });
  }
}
