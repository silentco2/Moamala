import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthStore } from '@moamala/core/auth';
import { RealtimeService } from '@moamala/core/realtime';
import { RealtimeEvent, User } from '@moamala/shared/models';
import { filter, Subject } from 'rxjs';
import { PresenceIndicator } from './presence-indicator';

const user = (id: string, en: string): User => ({
  id,
  name: { en, ar: en },
  email: `${id}@test`,
  role: 'reviewer',
});
const USERS = [user('me', 'Me Myself'), user('u-2', 'Viewer Two'), user('u-3', 'Viewer Three')];

function render() {
  const events = new Subject<RealtimeEvent>();
  const realtime = {
    send: vi.fn(),
    on: (kind: string) => events.pipe(filter((event) => event.type === kind)),
  };
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [
      { provide: RealtimeService, useValue: realtime },
      { provide: AuthStore, useValue: { user: signal(USERS[0]) } },
    ],
  });
  const fixture = TestBed.createComponent(PresenceIndicator);
  fixture.componentRef.setInput('requestId', 'req-1');
  fixture.componentRef.setInput('users', USERS);
  fixture.detectChanges();
  const viewers = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="presence-viewer"]'),
    ) as HTMLElement[];
  return { fixture, realtime, events, viewers };
}

describe('PresenceIndicator', () => {
  it('T5.4 announces that the user is viewing the request', () => {
    const { realtime } = render();
    expect(realtime.send).toHaveBeenCalledWith({ type: 'presence.join', requestId: 'req-1' });
  });

  it('T5.4 lists the other viewers of this request only', () => {
    const { fixture, events, viewers } = render();
    events.next({ type: 'presence', requestId: 'req-1', userIds: ['me', 'u-2'] });
    events.next({ type: 'presence', requestId: 'req-other', userIds: ['u-3'] });
    fixture.detectChanges();
    expect(viewers().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Viewer Two');
  });

  it('T5.4 hides itself when nobody else is viewing', () => {
    const { fixture, events } = render();
    events.next({ type: 'presence', requestId: 'req-1', userIds: ['me'] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="presence"]')).toBeNull();
  });

  it('T5.4 leaves when destroyed', () => {
    const { fixture, realtime } = render();
    fixture.destroy();
    expect(realtime.send).toHaveBeenLastCalledWith({ type: 'presence.leave', requestId: 'req-1' });
  });
});
