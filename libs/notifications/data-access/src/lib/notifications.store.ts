import { signal } from '@angular/core';
import { signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AppNotification } from '@moamala/shared/models';

export interface NotificationsState {
  items: AppNotification[];
  loading: boolean;
}

export const LATEST_NOTIFICATIONS = 5;

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState<NotificationsState>({ items: [], loading: false }),
  // TODO(T5.3): replace with computed(): `unreadCount` and `latest` (first LATEST_NOTIFICATIONS).
  //   Docs: https://ngrx.io/guide/signals/signal-store#defining-computed-signals
  withComputed(() => ({
    unreadCount: signal(0).asReadonly(),
    latest: signal<AppNotification[]>([]).asReadonly(),
  })),
  // TODO(T5.3): methods backed by NotificationsApi:
  //   - load(): rxMethod<void>, newest first as returned by the API
  //   - markRead(id): optimistic (flip `read` locally first), then PATCH
  //   - markAllRead(): optimistic, then POST read-all
  //   Docs: https://ngrx.io/guide/signals/rxjs-integration
  withMethods(() => ({
    load: (): void => undefined,
    markRead: (_id: string): void => undefined,
    markAllRead: (): void => undefined,
  })),
  // TODO(T5.2): withHooks({ onInit }): subscribe to RealtimeService.on('notification') and
  //   prepend each notification (ignore duplicates by id).
  //   Docs: https://ngrx.io/guide/signals/signal-store/lifecycle-hooks
  // TODO(T5.3): in the same hook, open a MatSnackBar for kinds in HIGH_PRIORITY_KINDS with the
  //   translated text `notifications.kind.<kind>` (param refNo from the payload).
  //   Docs: https://material.angular.dev/components/snack-bar/overview
);
