import { Injectable, Signal, signal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ConnectionStatus, RealtimeClientMessage, RealtimeEvent } from '@moamala/shared/models';

export type RealtimeEventOf<T extends RealtimeEvent['type']> = Extract<RealtimeEvent, { type: T }>;

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  // TODO(T5.1): expose the connection state as a read-only signal:
  //   'idle' -> 'connecting' -> 'open' -> ('reconnecting' -> 'open')* -> 'closed'.
  readonly status: Signal<ConnectionStatus> = signal<ConnectionStatus>('idle');

  // TODO(T5.1): one shared stream of typed server events for the whole app. It must keep working
  //   across reconnects, so subscribers never need to resubscribe (a Subject you feed from the
  //   socket is the simplest shape).
  readonly events$: Observable<RealtimeEvent> = EMPTY;

  // TODO(T5.1): open `${REALTIME_URL}?token=${token}` with webSocket() from 'rxjs/webSocket',
  //   passing WebSocketCtor from WEB_SOCKET_CTOR and openObserver/closeObserver to drive `status`.
  //   On an unexpected close or error, reconnect with exponential backoff:
  //   RECONNECT_BASE_DELAY_MS * 2^(attempt - 1), capped at RECONNECT_MAX_DELAY_MS, and reset the
  //   attempt counter once a connection opens. Calling connect() again replaces the old socket.
  //   Hint: `retry({ delay })` on the socket observable handles the backoff neatly.
  //   Docs: https://rxjs.dev/api/webSocket/webSocket
  connect(_token: string): void {
    return;
  }

  // TODO(T5.1): close the socket, stop reconnecting, set status to 'closed'.
  disconnect(): void {
    return;
  }

  // TODO(T5.1): send a client message (the WebSocketSubject serializes it with JSON.stringify).
  send(_message: RealtimeClientMessage): void {
    return;
  }

  // TODO(T5.1): typed helper: `on('notification')` emits only notification events, typed as such.
  //   Hint: `filter((event): event is RealtimeEventOf<T> => event.type === type)`.
  //   Docs: https://rxjs.dev/api/operators/filter
  on<T extends RealtimeEvent['type']>(_type: T): Observable<RealtimeEventOf<T>> {
    return EMPTY;
  }
}
