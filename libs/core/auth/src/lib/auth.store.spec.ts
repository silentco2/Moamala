import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginResponse, User } from '@moamala/shared/models';
import { AUTH_STORAGE_KEY, AuthStore } from './auth.store';

const reviewer: User = {
  id: 'u-9',
  name: { en: 'Test Reviewer', ar: 'مراجع' },
  email: 'test@reviewer.demo',
  role: 'reviewer',
};

describe('AuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  async function loginAsReviewer() {
    const store = TestBed.inject(AuthStore);
    const result = store.login('test@reviewer.demo');
    const req = TestBed.inject(HttpTestingController).expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@reviewer.demo' });
    req.flush({ token: 'jwt-1', user: reviewer } satisfies LoginResponse);
    return { store, user: await result };
  }

  it('T1.3 logs in and exposes the session', async () => {
    const { store, user } = await loginAsReviewer();
    expect(user).toEqual(reviewer);
    expect(store.user()).toEqual(reviewer);
    expect(store.token()).toBe('jwt-1');
    expect(store.isAuthenticated()).toBe(true);
  });

  it('T1.3 derives role flags', async () => {
    const { store } = await loginAsReviewer();
    expect(store.role()).toBe('reviewer');
    expect(store.isReviewer()).toBe(true);
    expect(store.isStaff()).toBe(true);
    expect(store.isAdmin()).toBe(false);
    expect(store.isApplicant()).toBe(false);
  });

  it('T1.3 persists the session', async () => {
    await loginAsReviewer();
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? 'null')).toEqual({
      token: 'jwt-1',
      user: reviewer,
    });
  });

  it('T1.3 logout clears the session and goes to /login', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { store } = await loginAsReviewer();
    store.logout();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.user()).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('T1.3 restores a persisted session on init', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 'jwt-2', user: reviewer }));
    const store = TestBed.inject(AuthStore);
    expect(store.token()).toBe('jwt-2');
    expect(store.isReviewer()).toBe(true);
  });

  it('T1.3 ignores a corrupted persisted session', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, '{not json');
    const { store } = await loginAsReviewer();
    expect(store.isAuthenticated()).toBe(true);
  });
});
