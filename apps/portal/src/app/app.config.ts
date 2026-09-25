import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // TODO(T1.1): configure the router with withComponentInputBinding() (route params, query
    //   params and resolved data become component inputs), withViewTransitions(), and
    //   withRouterConfig({ paramsInheritanceStrategy: 'always' }) so child routes (the decision
    //   panel outlet) inherit the parent's resolved `detail`.
    //   Docs: https://angular.dev/guide/routing/common-router-tasks#getting-route-information
    provideRouter(appRoutes),
    // TODO(T1.1): provideHttpClient(withInterceptors([...])) with the T1.4 interceptors in this
    //   order: auth, retry, unauthorized, error. Order matters: an interceptor sees the
    //   request before the ones after it, and the response after them.
    //   Docs: https://angular.dev/guide/http/setup#withinterceptors
    // TODO(T1.1): provideTransloco({ config: { availableLangs: ['en', 'ar'], defaultLang: 'en',
    //   reRenderOnLangChange: true, prodMode: !isDevMode() }, loader: TranslocoHttpLoader })
    //   Docs: https://jsverse.github.io/transloco/docs/getting-started/installation
    // TODO(T1.1): NgRx root: provideStore(), provideEffects(), and
    //   provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }). Feature state is registered
    //   per route with provideReviewState() (T3.3).
    //   Docs: https://ngrx.io/guide/store/install
    // TODO(T1.5): provideAppInitializer(() => inject(LanguageService).restore())
    //   Docs: https://angular.dev/api/core/provideAppInitializer
    // TODO(T1.6): { provide: CURRENT_ROLE, useFactory: () => inject(AuthStore).role } so
    //   *moHasRole (shared/util-common) can read the role without depending on core/auth.
    //   Docs: https://angular.dev/guide/di/dependency-injection-providers#factory-providers-usefactory
    // TODO(T5.1): provideRealtimeConnection()
    //   Docs: https://angular.dev/api/core/provideEnvironmentInitializer
  ],
};
