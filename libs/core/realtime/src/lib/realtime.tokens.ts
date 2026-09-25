import { InjectionToken } from '@angular/core';

export const REALTIME_URL = new InjectionToken<string>('REALTIME_URL', {
  factory: () => 'ws://localhost/realtime',
});

/** Tests swap in a fake socket; pass it to rxjs `webSocket({ WebSocketCtor })`. */
export const WEB_SOCKET_CTOR = new InjectionToken<typeof WebSocket>('WEB_SOCKET_CTOR', {
  factory: () => WebSocket,
});

export const RECONNECT_BASE_DELAY_MS = 1000;

export const RECONNECT_MAX_DELAY_MS = 30_000;
