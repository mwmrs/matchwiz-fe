import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { firstValueFrom, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import type { User, LoginRequest, PasswordResetConfirmRequest, PasswordResetRequest, RegisterRequest } from '../api/models';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  registrationPending: boolean;
  resetRequested: boolean;
  resetComplete: boolean;
}

const TOKEN_KEY = 'mw_token';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    user: null,
    token: null,
    loading: false,
    error: null,
    registrationPending: false,
    resetRequested: false,
    resetComplete: false,
  }),
  withComputed((store) => ({
    isAuthenticated: computed(() => store.token() !== null && store.user() !== null),
    isAdmin: computed(() => store.user()?.globalRole === 'ADMIN'),
    currentUserId: computed(() => store.user()?.id ?? null),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    login: rxMethod<LoginRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((req) =>
          authService.login(req).pipe(
            tapResponse({
              next: (res) => {
                localStorage.setItem(TOKEN_KEY, res.token);
                patchState(store, { user: res.user, token: res.token, loading: false });
                router.navigate(['/dashboard']);
              },
              error: (err: { status?: number }) => {
                const error = err.status === 403 ? 'auth.accountNotApproved' : 'auth.invalidCredentials';
                patchState(store, { loading: false, error });
              },
            }),
          ),
        ),
      ),
    ),

    register: rxMethod<RegisterRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, registrationPending: false })),
        switchMap((req) =>
          authService.register(req).pipe(
            tapResponse({
              next: () => {
                patchState(store, { loading: false, registrationPending: true });
              },
              error: (err: { status?: number }) => {
                const error = err.status === 409 ? 'auth.usernameTaken' : 'common.error';
                patchState(store, { loading: false, error });
              },
            }),
          ),
        ),
      ),
    ),

    requestPasswordReset: rxMethod<PasswordResetRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((req) =>
          authService.requestPasswordReset(req).pipe(
            tapResponse({
              next: () => patchState(store, { loading: false, resetRequested: true }),
              error: () => patchState(store, { loading: false, error: 'common.error' }),
            }),
          ),
        ),
      ),
    ),

    confirmPasswordReset: rxMethod<PasswordResetConfirmRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((req) =>
          authService.confirmPasswordReset(req).pipe(
            tapResponse({
              next: () => patchState(store, { loading: false, resetComplete: true }),
              error: (err: { status?: number }) => {
                const error = err.status === 400 ? 'auth.resetInvalidCode' : 'common.error';
                patchState(store, { loading: false, error });
              },
            }),
          ),
        ),
      ),
    ),

    logout() {
      localStorage.removeItem(TOKEN_KEY);
      patchState(store, { user: null, token: null, error: null, registrationPending: false, resetRequested: false, resetComplete: false });
      router.navigate(['/']);
    },

    async initializeSession(): Promise<void> {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;
      patchState(store, { token, loading: true });
      try {
        const user = await firstValueFrom(authService.getMe());
        patchState(store, { user, loading: false });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        patchState(store, { token: null, loading: false });
      }
    },

    setUser(user: User) {
      patchState(store, { user });
    },

    clearError() {
      patchState(store, { error: null, resetRequested: false, resetComplete: false });
    },
  })),
);
