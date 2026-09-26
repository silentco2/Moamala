import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User } from '@moamala/shared/models';
import { UsersStore } from './users.store';

const user = (id: string, role: User['role']): User => ({
  id,
  name: { en: id, ar: id },
  email: `${id}@test`,
  role,
});

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), UsersStore],
  });
  const store = TestBed.inject(UsersStore);
  const httpMock = TestBed.inject(HttpTestingController);
  store.load();
  httpMock.expectOne('/api/users').flush([user('u-1', 'applicant'), user('u-2', 'reviewer')]);
  return { store, httpMock };
}

describe('UsersStore', () => {
  it('T4.5 loads the users', () => {
    const { store } = setup();
    expect(store.users().map((item) => item.id)).toEqual(['u-1', 'u-2']);
    expect(store.loading()).toBe(false);
  });

  it('T4.5 updates a role optimistically', () => {
    const { store, httpMock } = setup();
    store.updateRole({ userId: 'u-1', role: 'approver' });
    expect(store.users()[0].role).toBe('approver');
    expect(store.savingIds()).toEqual(['u-1']);
    const req = httpMock.expectOne('/api/users/u-1/role');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: 'approver' });
    req.flush(user('u-1', 'approver'));
    expect(store.savingIds()).toEqual([]);
  });

  it('T4.5 rolls back when the API rejects the change', () => {
    const { store, httpMock } = setup();
    store.updateRole({ userId: 'u-2', role: 'admin' });
    httpMock.expectOne('/api/users/u-2/role').flush(
      {
        status: 422,
        message: 'errors.validation',
        fieldErrors: { role: ['validation.ownRole'] },
      },
      { status: 422, statusText: 'Unprocessable' },
    );
    expect(store.users()[1].role).toBe('reviewer');
    expect(store.savingIds()).toEqual([]);
    expect(store.error()).toBe('errors.validation');
  });

  it('T4.5 runs edits for different users in parallel', () => {
    const { store, httpMock } = setup();
    store.updateRole({ userId: 'u-1', role: 'admin' });
    store.updateRole({ userId: 'u-2', role: 'approver' });
    expect(httpMock.match((req) => req.url.endsWith('/role')).length).toBe(2);
  });
});
