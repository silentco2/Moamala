import { AppNotification } from './notification';
import { ServiceRequest } from './service-request';

/** Server -> client messages pushed on the realtime channel. */
export type RealtimeEvent =
  | { type: 'request.updated'; request: ServiceRequest }
  | { type: 'request.assigned'; requestId: string; assigneeId: string }
  | { type: 'notification'; notification: AppNotification }
  | { type: 'presence'; requestId: string; userIds: string[] };

/**
 * Client -> server messages sent on the realtime channel. The client authenticates by passing
 * its token as the `token` query parameter of the socket URL.
 */
export type RealtimeClientMessage =
  | { type: 'presence.join'; requestId: string }
  | { type: 'presence.leave'; requestId: string };

export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';
