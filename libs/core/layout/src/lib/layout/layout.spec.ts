import { BreakpointObserver } from '@angular/cdk/layout';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSidenav } from '@angular/material/sidenav';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthStore } from '@moamala/core/auth';
import { Role, User } from '@moamala/shared/models';
import { of } from 'rxjs';
import { Layout } from './layout';

function render(role: Role, handset = false) {
  const user: User = { id: 'u', name: { en: 'Test User', ar: 'مستخدم' }, email: 'u@test', role };
  const auth = { user: signal(user), role: signal(role), logout: vi.fn() };
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [
      provideRouter([]),
      { provide: AuthStore, useValue: auth },
      {
        provide: BreakpointObserver,
        useValue: { observe: () => of({ matches: handset, breakpoints: {} }) },
      },
    ],
  });
  const fixture = TestBed.createComponent(Layout);
  fixture.detectChanges();
  return { fixture, auth };
}

const navLinks = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('[data-testid="nav-item"]')).map((a) => a.getAttribute('href'));

describe('Layout', () => {
  it('T1.6 shows only the navigation allowed for the role', () => {
    expect(navLinks(render('reviewer').fixture.nativeElement)).toEqual([
      '/review/inbox',
      '/notifications',
    ]);
  });

  it('T1.6 shows the admin area to admins', () => {
    const links = navLinks(render('admin').fixture.nativeElement);
    expect(links).toContain('/admin/users');
    expect(links).not.toContain('/applicant/catalog');
  });

  it('T1.6 uses an overlay sidenav on handsets', () => {
    const { fixture } = render('applicant', true);
    const sidenav = fixture.debugElement.query(By.directive(MatSidenav))
      .componentInstance as MatSidenav;
    expect(sidenav.mode).toBe('over');
    expect(sidenav.opened).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-testid="menu-toggle"]')).not.toBeNull();
  });

  it('T1.6 keeps a side sidenav and hides the menu button on larger screens', () => {
    const { fixture } = render('applicant', false);
    const sidenav = fixture.debugElement.query(By.directive(MatSidenav))
      .componentInstance as MatSidenav;
    expect(sidenav.mode).toBe('side');
    expect(fixture.nativeElement.querySelector('[data-testid="menu-toggle"]')).toBeNull();
  });

  it('T1.6 signs out from the user menu', () => {
    const { fixture, auth } = render('applicant');
    fixture.nativeElement.querySelector('[data-testid="user-menu"]').click();
    fixture.detectChanges();
    (document.querySelector('[data-testid="logout"]') as HTMLElement).click();
    expect(auth.logout).toHaveBeenCalled();
  });
});
