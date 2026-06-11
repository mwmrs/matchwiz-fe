import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { passwordMismatch: true };
};

class ConfirmPasswordErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control?.touched && control.parent?.hasError('passwordMismatch'));
  }
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
  template: `
    <ng-container *transloco="let t">
      <div class="auth-card">
        <h1 class="auth-title">{{ t('auth.register') }}</h1>

        @if (authStore.registrationPending()) {
          <div class="auth-success" role="status">
            {{ t('auth.pendingApproval') }}
          </div>
          <p class="auth-link">
            <a routerLink="/login">{{ t('auth.login') }}</a>
          </p>
        } @else {
          @if (authStore.error()) {
            <div class="auth-error" role="alert">{{ t(authStore.error()!) }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>{{ t('auth.username') }}</mat-label>
              <input matInput formControlName="username" autocomplete="username" maxlength="16" />              
            </mat-form-field>
            @if (form.get('username')?.hasError('minlength') && form.get('username')?.touched) {
              <p class="field-error" role="alert">{{ t('auth.usernameMinLength', { usrMinLength: 3 }) }}</p>
            }

            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>{{ t('auth.password') }}</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" maxlength="100" />
            </mat-form-field>
            @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
              <p class="field-error" role="alert">{{ t('auth.passwordMinLength', { pwdMinLength: 8 }) }}</p>
            }

            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>{{ t('auth.confirmPassword') }}</mat-label>
              <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password" [errorStateMatcher]="passwordMismatchMatcher" maxlength="100" />
            </mat-form-field>
            @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
              <p class="field-error" role="alert">{{ t('auth.passwordMismatch') }}</p>
            }

            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>{{ t('auth.email') }}</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" maxlength="100" />
            </mat-form-field>

            <button
              mat-flat-button
              type="submit"
              class="submit-btn"
              [disabled]="form.invalid || authStore.loading()"
            >
              @if (authStore.loading()) {
                <mat-spinner diameter="20" />
              } @else {
                {{ t('auth.registerBtn') }}
              }
            </button>
          </form>

          <p class="auth-link">
            {{ t('auth.hasAccount') }}
            <a routerLink="/login">{{ t('auth.login') }}</a>
          </p>
        }
      </div>
    </ng-container>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 440px;
    }

    .auth-card {
      background: var(--mw-surface);
      border-radius: var(--mw-radius-lg);
      padding: var(--mw-spacing-xl);
      width: 100%;
    }

    .auth-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--mw-text);
      margin-bottom: var(--mw-spacing-lg);
      text-align: center;
    }

    .auth-error {
      background: rgba(255, 109, 0, 0.15);
      border: 1px solid var(--mw-warn);
      border-radius: var(--mw-radius-sm);
      padding: var(--mw-spacing-sm) var(--mw-spacing-md);
      color: var(--mw-warn);
      font-size: 14px;
      margin-bottom: var(--mw-spacing-md);
    }

    .auth-success {
      background: rgba(198, 255, 0, 0.12);
      border: 1px solid var(--mw-accent);
      border-radius: var(--mw-radius-sm);
      padding: var(--mw-spacing-md);
      color: var(--mw-accent);
      font-size: 14px;
      margin-bottom: var(--mw-spacing-md);
      text-align: center;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--mw-spacing-sm);
    }

    .field-error {
      color: var(--mw-warn);
      font-size: 12px;
      margin-top: calc(-1 * var(--mw-spacing-sm) + 2px);
    }

    .submit-btn {
      background: var(--mw-accent) !important;
      color: #000 !important;
      font-weight: 700;
      height: 48px;
      border-radius: var(--mw-radius-sm);
      font-size: 15px;
      margin-top: var(--mw-spacing-sm);
      display: flex;
      align-items: center;
      justify-content: center;

      &:disabled {
        opacity: 0.45;
      }
    }

    .auth-link {
      text-align: center;
      margin-top: var(--mw-spacing-md);
      color: var(--mw-text-muted);
      font-size: 14px;

      a {
        color: var(--mw-accent);
        font-weight: 600;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  protected readonly passwordMismatchMatcher = new ConfirmPasswordErrorMatcher();

  protected readonly form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      email: ['', Validators.email],
    },
    { validators: passwordMatchValidator }
  );

  submit() {
    if (this.form.invalid) return;
    const { username, password, email } = this.form.getRawValue();
    this.authStore.register({
      username: username!,
      password: password!,
      ...(email ? { email } : {}),
    });
  }
}
