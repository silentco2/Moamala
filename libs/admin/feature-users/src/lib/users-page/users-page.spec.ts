import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { User } from '@moamala/shared/models';
import { UsersPage } from './users-page';

const user = (id: string, role: User['role']): User => ({ id, name: { en: `Name ${id}`, ar: id }, email: `${id}@test`, role });

describe('UsersPage', () => {
  it('T4.5 lists users and saves inline role changes', () => {
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(UsersPage);
    fixture.detectChanges();
    TestBed.tick();
    httpMock.expectOne('/api/users').flush([user('u-1', 'applicant'), user('u-2', 'reviewer')]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="user-row"]');
    expect(rows.length).toBe(2);
    const select = rows[1].querySelector('[data-testid="role-select"]') as HTMLSelectElement;
    expect(select.value).toBe('reviewer');

    select.value = 'admin';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const req = httpMock.expectOne('/api/users/u-2/role');
    expect(req.request.body).toEqual({ role: 'admin' });
  });
});
