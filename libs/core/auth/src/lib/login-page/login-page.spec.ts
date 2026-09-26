import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { User } from '@moamala/shared/models';
import { LoginPage } from './login-page';

const USERS: User[] = [
  { id: 'a', name: { en: 'Test Applicant', ar: 'مقدم' }, email: 'a@test', role: 'applicant' },
  { id: 'b', name: { en: 'Test Admin', ar: 'مدير' }, email: 'b@test', role: 'admin' },
];

async function render() {
  sessionStorage.clear();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const httpMock = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(LoginPage);
  fixture.detectChanges();
  TestBed.tick();
  httpMock.expectOne('/api/auth/demo-users').flush(USERS);
  await fixture.whenStable();
  const tiles = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="demo-user"]'),
    ) as HTMLElement[];
  return { fixture, httpMock, navigate, tiles };
}

describe('LoginPage', () => {
  it('T1.3 lists the demo accounts', async () => {
    const { tiles } = await render();
    expect(tiles().length).toBe(2);
    expect(tiles()[1].textContent).toContain('Test Admin');
  });

  it('T1.3 signs in with a demo account and opens the role home', async () => {
    const { tiles, httpMock, navigate, fixture } = await render();
    tiles()[1].click();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.body).toEqual({ email: 'b@test' });
    req.flush({ token: 't', user: USERS[1] });
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith('/admin/types');
  });

  it('T1.3 shows an error when sign-in fails', async () => {
    const { tiles, httpMock, fixture } = await render();
    tiles()[0].click();
    httpMock
      .expectOne('/api/auth/login')
      .flush(
        { status: 401, message: 'errors.invalidCredentials' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-testid="login-error"]')).not.toBeNull();
  });
});
