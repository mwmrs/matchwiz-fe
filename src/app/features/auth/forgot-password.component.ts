import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-forgot-password',
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
        @if (authStore.resetComplete()) {
          <h1 class="auth-title">{{ t('auth.forgotPasswordTitle') }}</h1>
          <div class="auth-success" role="status">{{ t('auth.resetComplete') }}</div>
          <p class="auth-link">
            <a routerLink="/login">{{ t('auth.backToLogin') }}</a>
          </p>
        } @else if (authStore.resetRequested()) {
          <h1 class="auth-title">{{ t('auth.resetCodeTitle') }}</h1>

          @if (authStore.error()) {
            <div class="auth-error" role="alert">{{ t(authStore.error()!) }}</div>
          }

          <form [formGroup]="confirmForm" (ngSubmit)="submitConfirm()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>{{ t('auth.resetCode') }}</mat-label>
              <input matInput formControlName="code" autocomplete="one-time-code" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ t('auth.newPassword') }}</mat-label>
              <input matInput type="password" formControlName="newPassword" autocomplete="new-password" maxlength="100" />
              @if (confirmForm.controls.newPassword.touched && confirmForm.controls.newPassword.hasError('minlength')) {
                <mat-error>{{ t('auth.passwordMinLength', { pwdMinLength: 8 }) }}</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              type="submit"
              class="submit-btn"
              [disabled]="confirmForm.invalid || authStore.loading()"
            >
              @if (authStore.loading()) {
                <mat-spinner diameter="20" />
              } @else {
                {{ t('auth.confirmResetBtn') }}
              }
            </button>
          </form>

          <p class="auth-link">
            <a routerLink="/login">{{ t('auth.backToLogin') }}</a>
          </p>
        } @else {
          <h1 class="auth-title">{{ t('auth.forgotPasswordTitle') }}</h1>

          @if (authStore.error()) {
            <div class="auth-error" role="alert">{{ t(authStore.error()!) }}</div>
          }

          <form [formGroup]="requestForm" (ngSubmit)="submitRequest()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>{{ t('auth.emailForReset') }}</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
            </mat-form-field>

            <button
              mat-flat-button
              type="submit"
              class="submit-btn"
              [disabled]="requestForm.invalid || authStore.loading()"
            >
              @if (authStore.loading()) {
                <mat-spinner diameter="20" />
              } @else {
                {{ t('auth.requestResetBtn') }}
              }
            </button>
          </form>

          <p class="auth-link">
            <a routerLink="/login">{{ t('auth.backToLogin') }}</a>
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
      background: rgba(76, 175, 80, 0.15);
      border: 1px solid #4caf50;
      border-radius: var(--mw-radius-sm);
      padding: var(--mw-spacing-sm) var(--mw-spacing-md);
      color: #4caf50;
      font-size: 14px;
      margin-bottom: var(--mw-spacing-md);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--mw-spacing-sm);
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
export class ForgotPasswordComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  protected readonly requestForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly confirmForm = this.fb.group({
    code: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  submitRequest() {
    if (this.requestForm.invalid) return;
    this.authStore.requestPasswordReset(this.requestForm.getRawValue() as { email: string });
  }

  submitConfirm() {
    if (this.confirmForm.invalid) return;
    this.authStore.confirmPasswordReset(this.confirmForm.getRawValue() as { code: string; newPassword: string });
  }
}
