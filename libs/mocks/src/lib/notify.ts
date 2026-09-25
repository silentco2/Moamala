import { AppNotification, NotificationKind, Role, ServiceRequest } from '@moamala/shared/models';
import { db } from './db/db';
import { publishNotification } from './realtime/realtime-link';

export function notifyUser(userId: string, kind: NotificationKind, request: ServiceRequest): void {
  const notification: AppNotification = {
    id: db.nextId('n'),
    userId,
    kind,
    payload: { requestId: request.id, refNo: request.refNo },
    read: false,
    at: new Date().toISOString(),
  };
  db.notifications.unshift(notification);
  publishNotification(notification);
}

export function notifyRole(role: Role, kind: NotificationKind, request: ServiceRequest): void {
  db.users.filter((user) => user.role === role).forEach((user) => notifyUser(user.id, kind, request));
}
