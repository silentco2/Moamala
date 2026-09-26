import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthStore } from '../auth.store';
import { RETRY_BASE_DELAY_MS, SKIP_ERROR_TOAST } from '../http-context';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';
import { retryInterceptor } from './retry.interceptor';
import { unauthorizedInterceptor } from './unauthorized.interceptor';

function setup(interceptor: HttpInterceptorFn, token: string | null = null) {
  const auth = { token: signal(token), logout: vi.fn() };
  const snackBar = { open: vi.fn() };
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: { errors: { server: 'Server error', forbidden: 'Forbidden' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideHttpClient(withInterceptors([interceptor])),
      provideHttpClientTesting(),
      { provide: AuthStore, useValue: auth },
      { provide: MatSnackBar, useValue: snackBar },
    ],
  });
  return {
    http: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
    auth,
    snackBar,
  };
}

const fail = (status: number, message = 'errors.server') => ({
  body: { status, message },
  opts: { status, statusText: 'Error' },
});

describe('authInterceptor', () => {
  it('T1.4 adds the bearer token to API requests', () => {
    const { http, httpMock } = setup(authInterceptor, 'jwt-1');
    http.get('/api/requests').subscribe();
    expect(httpMock.expectOne('/api/requests').request.headers.get('Authorization')).toBe(
      'Bearer jwt-1',
    );
  });

  it('T1.4 leaves non-API and anonymous requests untouched', () => {
    const { http, httpMock, auth } = setup(authInterceptor, 'jwt-1');
    http.get('/i18n/en.json').subscribe();
    expect(httpMock.expectOne('/i18n/en.json').request.headers.has('Authorization')).toBe(false);
    auth.token.set(null);
    http.get('/api/requests').subscribe();
    expect(httpMock.expectOne('/api/requests').request.headers.has('Authorization')).toBe(false);
    auth.token.set('jwt-2');
    http.get('/api/me').subscribe();
    expect(httpMock.expectOne('/api/me').request.headers.get('Authorization')).toBe('Bearer jwt-2');
  });
});

describe('unauthorizedInterceptor', () => {
  it('T1.4 logs out on 401 and rethrows', () => {
    const { http, httpMock, auth } = setup(unauthorizedInterceptor);
    const errors: HttpErrorResponse[] = [];
    http.get('/api/requests').subscribe({ error: (error) => errors.push(error) });
    const { body, opts } = fail(401, 'errors.unauthorized');
    httpMock.expectOne('/api/requests').flush(body, opts);
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(errors[0]?.status).toBe(401);
  });

  it('T1.4 does not log out for failed logins or other errors', () => {
    const { http, httpMock, auth } = setup(unauthorizedInterceptor);
    http.post('/api/auth/login', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/auth/login').flush(fail(401).body, fail(401).opts);
    http.get('/api/requests').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/requests').flush(fail(403).body, fail(403).opts);
    expect(auth.logout).not.toHaveBeenCalled();
    http.get('/api/me').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/me').flush(fail(401).body, fail(401).opts);
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});

describe('errorInterceptor', () => {
  it('T1.4 shows a translated snackbar for server errors', () => {
    const { http, httpMock, snackBar } = setup(errorInterceptor);
    const errors: unknown[] = [];
    http.get('/api/requests').subscribe({ error: (error) => errors.push(error) });
    httpMock.expectOne('/api/requests').flush(fail(500).body, fail(500).opts);
    expect(snackBar.open).toHaveBeenCalledTimes(1);
    expect(snackBar.open.mock.calls[0][0]).toBe('Server error');
    expect(errors.length).toBe(1);
  });

  it('T1.4 does not toast 401, 404 or 422 responses', () => {
    const { http, httpMock, snackBar } = setup(errorInterceptor);
    for (const status of [401, 404, 422]) {
      http.get(`/api/x${status}`).subscribe({ error: () => undefined });
      httpMock.expectOne(`/api/x${status}`).flush(fail(status).body, fail(status).opts);
    }
    expect(snackBar.open).not.toHaveBeenCalled();
    http.get('/api/forbidden').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/forbidden').flush(fail(403, 'errors.forbidden').body, fail(403).opts);
    expect(snackBar.open.mock.calls[0][0]).toBe('Forbidden');
  });

  it('T1.4 respects SKIP_ERROR_TOAST', () => {
    const { http, httpMock, snackBar } = setup(errorInterceptor);
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
    http.get('/api/requests', { context }).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/requests').flush(fail(500).body, fail(500).opts);
    expect(snackBar.open).not.toHaveBeenCalled();
    http.get('/api/other').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/other').flush(fail(500).body, fail(500).opts);
    expect(snackBar.open).toHaveBeenCalledTimes(1);
  });
});

describe('retryInterceptor', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('T1.4 retries failed GETs with exponential backoff', async () => {
    const { http, httpMock } = setup(retryInterceptor);
    const results: unknown[] = [];
    http.get('/api/requests').subscribe((value) => results.push(value));

    httpMock.expectOne('/api/requests').flush(fail(503).body, fail(503).opts);
    httpMock.expectNone('/api/requests');
    await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS);
    httpMock.expectOne('/api/requests').flush(fail(503).body, fail(503).opts);
    await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS);
    httpMock.expectNone('/api/requests');
    await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS);
    httpMock.expectOne('/api/requests').flush({ ok: true });
    expect(results).toEqual([{ ok: true }]);
  });

  it('T1.4 gives up after the retry budget', async () => {
    const { http, httpMock } = setup(retryInterceptor);
    const errors: HttpErrorResponse[] = [];
    http.get('/api/requests').subscribe({ error: (error) => errors.push(error) });
    httpMock.expectOne('/api/requests').flush(fail(500).body, fail(500).opts);
    await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS);
    httpMock.expectOne('/api/requests').flush(fail(500).body, fail(500).opts);
    await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS * 2);
    httpMock.expectOne('/api/requests').flush(fail(500).body, fail(500).opts);
    await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS * 4);
    httpMock.expectNone('/api/requests');
    expect(errors.map((error) => error.status)).toEqual([500]);
  });

  it('T1.4 never retries POSTs or 4xx responses', async () => {
    const { http, httpMock } = setup(retryInterceptor);
    const errors: HttpErrorResponse[] = [];
    http.post('/api/requests', {}).subscribe({ error: (error) => errors.push(error) });
    httpMock.expectOne('/api/requests').flush(fail(500).body, fail(500).opts);
    http.get('/api/missing').subscribe({ error: (error) => errors.push(error) });
    httpMock.expectOne('/api/missing').flush(fail(404).body, fail(404).opts);
    await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS * 8);
    httpMock.expectNone('/api/requests');
    httpMock.expectNone('/api/missing');
    expect(errors.map((error) => error.status)).toEqual([500, 404]);

    http.head('/api/ping').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/ping').flush(null, { status: 0, statusText: 'Unknown Error' });
    await vi.advanceTimersByTimeAsync(RETRY_BASE_DELAY_MS);
    httpMock.expectOne('/api/ping');
  });
});
