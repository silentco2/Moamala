import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { AppNotification } from '@moamala/shared/models';

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  // TODO(T5.3): GET /api/notifications
  //   Docs: https://angular.dev/guide/http/making-requests
  list(): Observable<AppNotification[]> {
    return EMPTY;
  }

  // TODO(T5.3): PATCH /api/notifications/:id with `{ read: true }`
  //   Docs: https://angular.dev/guide/http/making-requests
  markRead(_id: string): Observable<AppNotification> {
    return EMPTY;
  }

  // TODO(T5.3): POST /api/notifications/read-all
  //   Docs: https://angular.dev/guide/http/making-requests
  markAllRead(): Observable<void> {
    return EMPTY;
  }
}
