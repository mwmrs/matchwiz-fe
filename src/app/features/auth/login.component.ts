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
  selector: 'app-login',
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
        <h1 class="auth-title">{{ t('auth.login') }}</h1>

        @if (authStore.error()) {
          <div class="auth-error" role="alert">{{ t(authStore.error()!) }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ t('auth.username') }}</mat-label>
            <input matInput formControlName="username" autocomplete="username" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ t('auth.password') }}</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password" />
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
              {{ t('auth.loginBtn') }}
            }
          </button>
        </form>

        <p class="auth-link">
          {{ t('auth.noAccount') }}
          <a routerLink="/register">{{ t('auth.register') }}</a>
        </p>
      </div>
    </ng-container>
  `,
  styles: [`
    .auth-card {
      background: var(--mw-surface);
      border-radius: var(--mw-radius-lg);
      padding: var(--mw-spacing-xl);
      width: 100%;
      max-width: 400px;
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
export class LoginComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.authStore.login(this.form.getRawValue() as { username: string; password: string });
  }
}
