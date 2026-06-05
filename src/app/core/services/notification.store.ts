import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpClient } from '@angular/common/http';
import type { Notification } from '../api/models';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
}

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState<NotificationState>({
    notifications: [],
    loading: false,
  }),
  withComputed((store) => ({
    unreadCount: computed(() => store.notifications().filter((n) => !n.read).length),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    load: rxMethod<void>(
      pipe(
        switchMap(() =>
          http.get<Notification[]>('/api/notifications').pipe(
            tapResponse({
              next: (notifications: Notification[]) => patchState(store, { notifications }),
              error: () => {},
            }),
          ),
        ),
      ),
    ),

    markRead: rxMethod<number>(
      pipe(
        switchMap((id) =>
          http.patch<Notification>(`/api/notifications/${id}/read`, {}).pipe(
            tapResponse({
              next: (updated: Notification) =>
                patchState(store, {
                  notifications: store.notifications().map((n) => (n.id === id ? updated : n)),
                }),
              error: () => {},
            }),
          ),
        ),
      ),
    ),

    markAllRead() {
      const unread = store.notifications().filter((n) => !n.read);
      unread.forEach((n) => {
        const idx = store.notifications().findIndex((x) => x.id === n.id);
        if (idx !== -1) {
          const updated = [...store.notifications()];
          updated[idx] = { ...n, read: true };
          patchState(store, { notifications: updated });
        }
      });
    },
  })),
);
