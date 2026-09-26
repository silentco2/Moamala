import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { CURRENT_ROLE } from '@moamala/shared/util-common';
import { appConfig } from './app.config';

@Component({ template: '{{ id() }}' })
class Probe {
  readonly id = input<string>();
}

describe('appConfig', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
  });

  it('T1.4 registers the HTTP interceptors', () => {
    const user = { id: 'u', name: { en: 'U', ar: 'U' }, email: 'u@test', role: 'applicant' };
    sessionStorage.setItem('moamala.auth', JSON.stringify({ token: 'jwt-app', user }));
    TestBed.inject(HttpClient).get('/api/requests').subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/requests');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-app');
  });

  it('T1.1 configures Transloco for English and Arabic', () => {
    const transloco = TestBed.inject(TranslocoService);
    expect(transloco.getAvailableLangs()).toEqual(['en', 'ar']);
    expect(transloco.getDefaultLang()).toBe('en');
  });

  it('T1.1 provides the root NgRx store and effects', () => {
    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(Actions)).toBeTruthy();
  });

  it('T1.1 binds route params to component inputs', async () => {
    TestBed.inject(Router).resetConfig([{ path: 'probe/:id', component: Probe }]);
    const harness = await RouterTestingHarness.create();
    const probe = await harness.navigateByUrl('/probe/42', Probe);
    expect(probe.id()).toBe('42');
  });

  it('T1.6 provides CURRENT_ROLE from the session', () => {
    expect(TestBed.inject(CURRENT_ROLE)()).toBeNull();
  });
});
