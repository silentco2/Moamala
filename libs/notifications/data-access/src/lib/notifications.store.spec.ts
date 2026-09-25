import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { RealtimeService } from '@moamala/core/realtime';
import { AppNotification, NotificationKind, RealtimeEvent } from '@moamala/shared/models';
import { filter, Subject } from 'rxjs';
import { NotificationsStore } from './notifications.store';

const notification = (
  id: string,
  kind: NotificationKind = 'request.approved',
  read = false,
): AppNotification => ({
  id,
  userId: 'u-1',
  kind,
  payload: { requestId: 'req-1', refNo: 'FX-1' },
  read,
  at: '2026-01-01T00:00:00Z',
});

function setup() {
  const events = new Subject<RealtimeEvent>();
  const snackBar = { open: vi.fn() };
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: {
          en: { notifications: { kind: { 'sla.breached': 'SLA breached for {{refNo}}' } } },
        },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: MatSnackBar, useValue: snackBar },
      {
        provide: RealtimeService,
        useValue: { on: (kind: string) => events.pipe(filter((event) => event.type === kind)) },
      },
    ],
  });
  const store = TestBed.inject(NotificationsStore);
  const httpMock = TestBed.inject(HttpTestingController);
  return { store, httpMock, events, snackBar };
}

function loaded() {
  const context = setup();
  context.store.load();
  context.httpMock
    .expectOne('/api/notifications')
    .flush([notification('n1'), notification('n2', 'request.returned', true), notification('n3')]);
  return context;
}

describe('NotificationsStore', () => {
  it('T5.3 loads notifications and counts the unread ones', () => {
    const { store } = loaded();
    expect(store.items().length).toBe(3);
    expect(store.unreadCount()).toBe(2);
    expect(store.latest().map((item) => item.id)).toEqual(['n1', 'n2', 'n3']);
  });

  it('T5.3 marks one notification read optimistically', () => {
    const { store, httpMock } = loaded();
    store.markRead('n1');
    expect(store.unreadCount()).toBe(1);
    const req = httpMock.expectOne('/api/notifications/n1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ read: true });
  });

  it('T5.3 marks everything read', () => {
    const { store, httpMock } = loaded();
    store.markAllRead();
    expect(store.unreadCount()).toBe(0);
    expect(httpMock.expectOne('/api/notifications/read-all').request.method).toBe('POST');
  });

  it('T5.2 prepends notifications pushed in realtime', () => {
    const { store, events } = loaded();
    events.next({ type: 'notification', notification: notification('n9') });
    events.next({ type: 'notification', notification: notification('n9') });
    expect(store.items()[0].id).toBe('n9');
    expect(store.items().length).toBe(4);
    expect(store.unreadCount()).toBe(3);
  });

  it('T5.3 shows a toast for high priority notifications only', () => {
    const { events, snackBar } = loaded();
    events.next({ type: 'notification', notification: notification('n7', 'request.approved') });
    expect(snackBar.open).not.toHaveBeenCalled();
    events.next({ type: 'notification', notification: notification('n8', 'sla.breached') });
    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open.mock.calls[0][0]).toBe('SLA breached for FX-1');
  });
});
