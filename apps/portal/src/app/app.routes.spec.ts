import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthStore } from '@moamala/core/auth';
import { Role, User } from '@moamala/shared/models';
import { CURRENT_ROLE } from '@moamala/shared/util-common';
import { appRoutes } from './app.routes';

function fakeAuth(role: Role | null) {
  const user = signal<User | null>(
    role ? { id: 'u-test', name: { en: 'Test', ar: 'Test' }, email: 't@test', role } : null,
  );
  const currentRole = computed(() => user()?.role ?? null);
  return {
    user,
    token: signal(role ? 'token' : null),
    role: currentRole,
    isAuthenticated: computed(() => user() !== null),
    isApplicant: computed(() => currentRole() === 'applicant'),
    isReviewer: computed(() => currentRole() === 'reviewer'),
    isApprover: computed(() => currentRole() === 'approver'),
    isAdmin: computed(() => currentRole() === 'admin'),
    isStaff: computed(() => currentRole() !== null && currentRole() !== 'applicant'),
    login: vi.fn(),
    logout: vi.fn(),
  };
}

async function navigate(url: string, role: Role | null) {
  const auth = fakeAuth(role);
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [
      provideRouter(appRoutes),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideStore(),
      provideEffects(),
      { provide: AuthStore, useValue: auth },
      { provide: CURRENT_ROLE, useValue: auth.role },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return { url: TestBed.inject(Router).url, harness };
}

describe('appRoutes', () => {
  it('T1.2 sends anonymous visitors to the login page', async () => {
    expect((await navigate('/', null)).url).toBe('/login');
    TestBed.resetTestingModule();
    expect((await navigate('/applicant/catalog', null)).url).toBe('/login');
  });

  it('T1.2 sends each role to its home page', async () => {
    expect((await navigate('/', 'reviewer')).url).toBe('/review/inbox');
    TestBed.resetTestingModule();
    expect((await navigate('/', 'applicant')).url).toBe('/applicant/catalog');
  });

  it('T1.2 keeps other roles out of the admin area', async () => {
    expect((await navigate('/admin/users', 'applicant')).url).toBe('/applicant/catalog');
  });

  it('T1.2 renders the 404 page for unknown URLs', async () => {
    const { harness } = await navigate('/does/not/exist', 'admin');
    expect(harness.routeNativeElement?.querySelector('[data-testid="not-found"]')).not.toBeNull();
  });
});
