import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { NotificationsStore } from '@moamala/notifications/data-access';
import { AppNotification } from '@moamala/shared/models';
import { NotificationsPage } from './notifications-page';

const item = (id: string, read: boolean) =>
  ({ id, userId: 'u', kind: 'request.approved', payload: { requestId: id, refNo: id }, read, at: '2026-01-01T00:00:00Z' }) as AppNotification;

function render() {
  const items = signal([item('a', false), item('b', true), item('c', false)]);
  const store = {
    items,
    unreadCount: computed(() => items().filter((entry) => !entry.read).length),
    markAllRead: vi.fn(),
    markRead: vi.fn(),
  };
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [provideRouter([]), { provide: NotificationsStore, useValue: store }],
  });
  const fixture = TestBed.createComponent(NotificationsPage);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const rows = () => el.querySelectorAll('[data-testid="notification-row"]').length;
  return { fixture, store, el, rows };
}

describe('NotificationsPage', () => {
  it('T5.3 lists all notifications and filters unread ones', () => {
    const { fixture, el, rows } = render();
    expect(rows()).toBe(3);
    (el.querySelector('[data-testid="filter-unread"] button') as HTMLElement).click();
    fixture.detectChanges();
    expect(rows()).toBe(2);
  });

  it('T5.3 marks everything as read', () => {
    const { el, store } = render();
    (el.querySelector('[data-testid="mark-all-read"]') as HTMLElement).click();
    expect(store.markAllRead).toHaveBeenCalled();
  });
});
