import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Role } from '@moamala/shared/models';
import { AuthStore } from './auth.store';
import { authGuard, roleGuard } from './guards';
import { redirectToRoleHome } from './role-home';

@Component({ template: 'page' })
class Page {}

async function navigate(url: string, role: Role | null) {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: AuthStore,
        useValue: { isAuthenticated: signal(role !== null), role: signal(role) },
      },
      provideRouter([
        { path: '', pathMatch: 'full', redirectTo: redirectToRoleHome },
        { path: 'login', component: Page },
        { path: 'secure', canActivate: [authGuard], component: Page },
        { path: 'admin/types', canMatch: [roleGuard('admin')], component: Page },
        { path: 'review/inbox', canMatch: [roleGuard('reviewer', 'approver')], component: Page },
        { path: 'applicant/catalog', canMatch: [roleGuard('applicant')], component: Page },
      ]),
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return TestBed.inject(Router).url;
}

describe('route guards', () => {
  it('T1.2 authGuard sends anonymous users to /login', async () => {
    expect(await navigate('/secure', null)).toBe('/login');
  });

  it('T1.2 authGuard lets signed-in users through', async () => {
    expect(await navigate('/secure', 'applicant')).toBe('/secure');
  });

  it('T1.2 roleGuard matches allowed roles', async () => {
    expect(await navigate('/review/inbox', 'approver')).toBe('/review/inbox');
  });

  it("T1.2 roleGuard redirects other roles to their own home", async () => {
    expect(await navigate('/admin/types', 'applicant')).toBe('/applicant/catalog');
  });

  it('T1.2 roleGuard redirects anonymous users to /login', async () => {
    expect(await navigate('/admin/types', null)).toBe('/login');
  });

  it('T1.2 redirectToRoleHome picks the landing page for the role', async () => {
    expect(await navigate('/', 'reviewer')).toBe('/review/inbox');
    TestBed.resetTestingModule();
    expect(await navigate('/', null)).toBe('/login');
  });
});
