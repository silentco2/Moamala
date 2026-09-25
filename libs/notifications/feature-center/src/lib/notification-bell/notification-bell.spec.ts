import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { NotificationsStore } from '@moamala/notifications/data-access';
import { AppNotification } from '@moamala/shared/models';
import { NotificationBell } from './notification-bell';

const item: AppNotification = {
  id: 'n-4',
  userId: 'u',
  kind: 'request.approved',
  payload: { requestId: 'req-4', refNo: 'FX-4' },
  read: false,
  at: '2026-01-01T00:00:00Z',
};

function render(unread: number) {
  const store = {
    unreadCount: signal(unread),
    latest: signal([item]),
    load: vi.fn(),
    markRead: vi.fn(),
  };
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [provideRouter([]), { provide: NotificationsStore, useValue: store }],
  });
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(NotificationBell);
  fixture.detectChanges();
  const badge = () => fixture.nativeElement.querySelector('.mat-badge-content') as HTMLElement | null;
  return { fixture, store, navigate, badge };
}

describe('NotificationBell', () => {
  it('T5.3 loads notifications and shows the unread count', () => {
    const { store, badge } = render(3);
    expect(store.load).toHaveBeenCalledTimes(1);
    expect(badge()?.textContent?.trim()).toBe('3');
  });

  it('T5.3 hides the badge when everything is read', () => {
    const { badge, fixture } = render(0);
    expect(fixture.nativeElement.querySelector('.mat-badge-hidden')).not.toBeNull();
    expect(badge()?.textContent?.trim()).not.toBe('2');
  });

  it('T5.3 opens a notification: marks it read and goes to the request', () => {
    const { fixture, store, navigate } = render(1);
    fixture.nativeElement.querySelector('[data-testid="notification-bell"]').click();
    fixture.detectChanges();
    (document.querySelector('[data-testid="notification-item"]') as HTMLElement).click();
    expect(store.markRead).toHaveBeenCalledWith('n-4');
    expect(navigate).toHaveBeenCalledWith('/requests/req-4');
  });
});
