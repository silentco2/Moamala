import { ws } from 'msw';
import {
  AppNotification,
  RealtimeClientMessage,
  RealtimeEvent,
  ServiceRequest,
  User,
} from '@moamala/shared/models';
import { userFromToken } from '../utils/auth';
import { leaveAll, presenceJoin, presenceLeave } from './presence';

export const REALTIME_URL = 'ws://localhost/realtime';

/**
 * MSW mirrors `clients` across tabs through its own BroadcastChannel, so
 * sending to a client here reaches sockets opened in other tabs too.
 */
export const realtime = ws.link(REALTIME_URL);

interface ClientLike {
  id: string;
  url: URL;
  send(data: string): void;
}

const userOf = (client: ClientLike): User | null =>
  userFromToken(client.url.searchParams.get('token'));

export function publish(event: RealtimeEvent, audience: (user: User) => boolean): void {
  const payload = JSON.stringify(event);
  for (const client of realtime.clients) {
    const user = userOf(client);
    if (user && audience(user)) client.send(payload);
  }
}

export function publishRequest(request: ServiceRequest): void {
  publish(
    { type: 'request.updated', request },
    (user) => user.role !== 'applicant' || user.id === request.applicantId,
  );
}

export function publishAssigned(request: ServiceRequest): void {
  if (!request.assigneeId) return;
  publish(
    { type: 'request.assigned', requestId: request.id, assigneeId: request.assigneeId },
    (user) => user.role !== 'applicant',
  );
}

export function publishNotification(notification: AppNotification): void {
  publish({ type: 'notification', notification }, (user) => user.id === notification.userId);
}

function isClientMessage(value: unknown): value is RealtimeClientMessage {
  return typeof value === 'object' && value !== null && 'type' in value && 'requestId' in value;
}

export const realtimeHandler = realtime.addEventListener('connection', ({ client }) => {
  const user = userOf(client);
  if (!user) {
    client.close(4401, 'Unauthorized');
    return;
  }

  client.addEventListener('message', (event) => {
    let message: unknown;
    try {
      message = JSON.parse(String(event.data));
    } catch {
      return;
    }
    if (!isClientMessage(message)) return;
    const userIds =
      message.type === 'presence.join'
        ? presenceJoin(message.requestId, client.id, user.id)
        : presenceLeave(message.requestId, client.id);
    publish({ type: 'presence', requestId: message.requestId, userIds }, () => true);
  });

  client.addEventListener('close', () => {
    for (const [requestId, userIds] of leaveAll(client.id)) {
      publish({ type: 'presence', requestId, userIds }, () => true);
    }
  });
});
