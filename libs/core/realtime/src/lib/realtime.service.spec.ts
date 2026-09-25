import { TestBed } from '@angular/core/testing';
import { RealtimeEvent, ServiceRequest } from '@moamala/shared/models';
import { RealtimeService } from './realtime.service';
import { RECONNECT_BASE_DELAY_MS, REALTIME_URL, WEB_SOCKET_CTOR } from './realtime.tokens';

/** Minimal stand-in for the browser WebSocket used by rxjs `webSocket()`. */
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState = FakeWebSocket.CONNECTING;
  binaryType = 'blob';
  sent: string[] = [];
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
  }

  static get latest(): FakeWebSocket {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
  }

  send(data: string) {
    this.sent.push(data);
  }

  close(code = 1000) {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code, wasClean: code === 1000 } as CloseEvent);
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.(new Event('open'));
  }

  receive(event: RealtimeEvent) {
    this.onmessage?.({ data: JSON.stringify(event) } as MessageEvent);
  }

  drop() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code: 1006, wasClean: false } as CloseEvent);
  }
}

const request = { id: 'req-1', status: 'approved' } as ServiceRequest;

describe('RealtimeService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: WEB_SOCKET_CTOR, useValue: FakeWebSocket },
        { provide: REALTIME_URL, useValue: 'ws://test/realtime' },
      ],
    });
  });
  afterEach(() => vi.useRealTimers());

  it('T5.1 connects with the token and reports the connection status', () => {
    const service = TestBed.inject(RealtimeService);
    expect(service.status()).toBe('idle');
    service.connect('jwt-1');
    expect(FakeWebSocket.latest.url).toBe('ws://test/realtime?token=jwt-1');
    expect(service.status()).toBe('connecting');
    FakeWebSocket.latest.open();
    expect(service.status()).toBe('open');
  });

  it('T5.1 emits parsed server events', () => {
    const service = TestBed.inject(RealtimeService);
    const events: RealtimeEvent[] = [];
    service.connect('jwt-1');
    service.events$.subscribe((event) => events.push(event));
    FakeWebSocket.latest.open();
    FakeWebSocket.latest.receive({ type: 'request.updated', request });
    expect(events).toEqual([{ type: 'request.updated', request }]);
  });

  it('T5.1 on(type) filters events by type', () => {
    const service = TestBed.inject(RealtimeService);
    const ids: string[] = [];
    service.on('request.assigned').subscribe((event) => ids.push(event.assigneeId));
    service.connect('jwt-1');
    FakeWebSocket.latest.open();
    FakeWebSocket.latest.receive({ type: 'request.updated', request });
    FakeWebSocket.latest.receive({
      type: 'request.assigned',
      requestId: 'req-1',
      assigneeId: 'u-2',
    });
    expect(ids).toEqual(['u-2']);
  });

  it('T5.1 sends client messages as JSON', () => {
    const service = TestBed.inject(RealtimeService);
    service.connect('jwt-1');
    FakeWebSocket.latest.open();
    service.send({ type: 'presence.join', requestId: 'req-1' });
    expect(FakeWebSocket.latest.sent.map((raw) => JSON.parse(raw))).toEqual([
      { type: 'presence.join', requestId: 'req-1' },
    ]);
  });

  it('T5.1 reconnects with exponential backoff and keeps streaming events', async () => {
    const service = TestBed.inject(RealtimeService);
    const events: RealtimeEvent[] = [];
    service.events$.subscribe((event) => events.push(event));
    service.connect('jwt-1');
    FakeWebSocket.latest.open();

    FakeWebSocket.latest.drop();
    expect(service.status()).toBe('reconnecting');
    await vi.advanceTimersByTimeAsync(RECONNECT_BASE_DELAY_MS - 1);
    expect(FakeWebSocket.instances.length).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(FakeWebSocket.instances.length).toBe(2);

    FakeWebSocket.latest.drop();
    await vi.advanceTimersByTimeAsync(RECONNECT_BASE_DELAY_MS * 2 - 1);
    expect(FakeWebSocket.instances.length).toBe(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(FakeWebSocket.instances.length).toBe(3);

    FakeWebSocket.latest.open();
    expect(service.status()).toBe('open');
    FakeWebSocket.latest.receive({ type: 'request.updated', request });
    expect(events.length).toBe(1);
  });

  it('T5.1 disconnect() closes the socket and stops reconnecting', async () => {
    const service = TestBed.inject(RealtimeService);
    service.connect('jwt-1');
    FakeWebSocket.latest.open();
    service.disconnect();
    expect(service.status()).toBe('closed');
    expect(FakeWebSocket.latest.readyState).toBe(FakeWebSocket.CLOSED);
    await vi.advanceTimersByTimeAsync(RECONNECT_BASE_DELAY_MS * 10);
    expect(FakeWebSocket.instances.length).toBe(1);
  });
});
