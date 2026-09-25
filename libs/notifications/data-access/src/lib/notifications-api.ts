import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { AppNotification } from '@moamala/shared/models';

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  // TODO(T5.3): GET /api/notifications
  list(): Observable<AppNotification[]> {
    return EMPTY;
  }

  // TODO(T5.3): PATCH /api/notifications/:id with `{ read: true }`
  markRead(_id: string): Observable<AppNotification> {
    return EMPTY;
  }

  // TODO(T5.3): POST /api/notifications/read-all
  markAllRead(): Observable<void> {
    return EMPTY;
  }
}
