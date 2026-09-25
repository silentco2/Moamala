# Mo'amala learning roadmap

Every piece of Angular logic in this repo is yours to write. The markup, styles, translations,
domain types and the whole mock backend are done, so each task is pure Angular.

## How to work a task

1. Find the task's TODOs: `grep -rn "TODO(T2.3)" apps libs`.
2. Read the hint and the linked docs; the spec next to the file shows the expected behavior.
3. Run the task's specs until they pass:

   ```sh
   pnpm nx test <project> --filter "T2.3"          # one task in one project
   pnpm nx run-many -t test --filter "T2\."        # a whole phase, every project
   ```

4. Try it in the browser (`pnpm start`), then delete the TODO comments you resolved.
5. When a phase is green, tag it: `git tag phase-2 && git push origin phase-2`.

Specs are written against public behavior (inputs, outputs, DOM `data-testid`s, HTTP calls, store
state), so any correct implementation passes. They fail today on purpose.

### Template conventions

- **Static sample content.** Each template shows one realistic example (one row, one card, one of
  each field type). Replace it with control flow and bindings.
- **`<ng-template>` placeholders.** Alternative states (loading, error, empty, other banners) are
  wrapped in a bare `<ng-template>` so they do not render yet. Turn each into the matching `@if`,
  `@switch` or `@defer` block.
- **`<!-- i18n: key -->`** marks the translation key for the text right below it. Keys live in
  `apps/portal/public/i18n/{en,ar}.json`. Replace the text with the `transloco` pipe or the
  `*transloco="let t"` structural directive as part of the task that owns the template.
- **`<!-- TODO(Tx.y): ... -->`** marks the bindings and events to add.
- Keep every `data-testid`; the specs rely on them.

### Things to know up front

- Angular 22 components are zoneless and use `OnPush` change detection **by default**. Signals
  (and the `async` pipe) are how the view learns about changes.
- Inputs set by the router: with `withComponentInputBinding()` (T1.1), route params, query params
  and resolved data arrive as component inputs with the same names.
- `nx test` builds the specs with the portal build configuration. A TypeScript error in any spec
  or stub of a project stops all of that project's specs, so keep the stubs compiling.
- Some specs depend on earlier tasks, noted as **Needs** below.

---

## Phase 1: Foundations

### T1.1 App configuration

- **Goal:** make `app.config.ts` provide the router, HTTP, Transloco and NgRx.
- **Concepts:** standalone providers, router features, functional interceptors, Transloco loader.
- **Files:** `apps/portal/src/app/app.config.ts`, `libs/core/i18n/src/lib/transloco-loader.ts`.
- **Acceptance:** route params bind to inputs, Transloco knows `en`/`ar` and loads
  `/i18n/<lang>.json`, the root Store and Effects exist.
- **Specs:** `pnpm nx test portal --filter "T1.1"`, `pnpm nx test core-i18n --filter "T1.1"`.
- **Deviation from the brief:** `provideAnimationsAsync()` is deprecated since Angular 20.2 and
  Material 22 no longer needs it, so it is not part of this task. Use native CSS or
  `animate.enter` / `animate.leave` if you want animations.

### T1.2 Routes and guards

- **Goal:** the full lazy route tree with auth and role guards, role-based home redirects and a 404.
- **Concepts:** `loadComponent`/`loadChildren`, functional `canActivate`/`canMatch`, redirect
  functions, route-level providers, named outlets.
- **Files:** `apps/portal/src/app/app.routes.ts`, `app.html`, `libs/core/auth/src/lib/guards.ts`,
  `libs/core/auth/src/lib/role-home.ts`, `libs/core/layout/src/lib/not-found-page/*`.
  Use `apps/portal/src/app/shell.ts` as the component of the signed-in parent route.
- **Acceptance:** anonymous users land on `/login`; each role lands on its home; other roles are
  kept out of `/admin`; unknown URLs show the 404 page; `app.html` renders `<router-outlet />`.
- **Specs:** `pnpm nx test core-auth --filter "T1.2"`, `pnpm nx test portal --filter "T1.2"`.

### T1.3 AuthStore and login

- **Goal:** sign in with a demo account, persist the session and restore it on reload.
- **Concepts:** NgRx SignalStore (`withState`, `withComputed`, `withMethods`, `withHooks`),
  `httpResource`.
- **Files:** `libs/core/auth/src/lib/auth.store.ts`, `libs/core/auth/src/lib/login-page/*`.
- **Acceptance:** login stores `{ token, user }` under `moamala.auth` in `sessionStorage` (per tab,
  so two tabs can be two users), role flags are computed,
  logout clears everything and goes to `/login`, a corrupt stored session is ignored; the login
  page lists demo users, signs in, opens the role home and shows an error on failure.
- **Specs:** `pnpm nx test core-auth --filter "T1.3"`.

### T1.4 HTTP interceptors

- **Goal:** auth header, 401 logout, global error snackbar, retry with backoff.
- **Concepts:** `HttpInterceptorFn`, `HttpContextToken`, RxJS `catchError` and `retry({ delay })`.
- **Files:** `libs/core/auth/src/lib/interceptors/*`, registration in `app.config.ts`.
- **Acceptance:** see the TODOs; the retry spec uses fake timers to check the exact delays.
- **Specs:** `pnpm nx test core-auth --filter "T1.4"`, `pnpm nx test portal --filter "T1.4"`
  (**Needs** T1.1 and T1.3).

### T1.5 Language and RTL

- **Goal:** switch English/Arabic at runtime with the correct text direction everywhere.
- **Concepts:** Transloco runtime switching, `document.dir`, CDK `Dir`/`Directionality`, pure pipes.
- **Files:** `libs/core/i18n/src/lib/language.service.ts`,
  `libs/shared/util-common/src/lib/localize.pipe.ts`, `libs/core/layout/src/lib/lang-switch/*`,
  the `[dir]` binding in `layout.html`, `provideAppInitializer` in `app.config.ts`, and the
  `i18n:` comments in the layout, login and 404 templates.
- **Acceptance:** switching sets `lang`/`dir` on `<html>`, persists under `moamala.lang`, the
  sidenav and menus flip in Arabic, and localized values follow the active language.
- **Specs:** `pnpm nx run-many -t test --filter "T1.5"`.

### T1.6 Layout shell

- **Goal:** role-aware navigation, a `*moHasRole` structural directive, responsive sidenav.
- **Concepts:** structural directives (`TemplateRef`, `ViewContainerRef`), `InjectionToken`,
  `BreakpointObserver` + `toSignal`, content projection.
- **Files:** `libs/core/layout/src/lib/layout/*`,
  `libs/shared/util-common/src/lib/has-role.directive.ts`, the `CURRENT_ROLE` provider in
  `app.config.ts`.
- **Acceptance:** nav items match the role; handsets get an overlay drawer and a menu button.
- **Specs:** `pnpm nx run-many -t test --filter "T1.6"`.

## Phase 2: Applicant

### T2.1 Service catalog

- **Goal:** load the catalog with `httpResource` and handle loading, error, empty and search.
- **Concepts:** `httpResource`, `computed`, `@if`/`@for`, `@defer (on viewport)`, inputs.
- **Files:** `libs/applicant/feature-catalog/src/lib/catalog-page/*`,
  `libs/shared/ui/src/lib/page-header/*`, `libs/shared/ui/src/lib/empty-state/*`.
- **Specs:** `pnpm nx test applicant-feature-catalog --filter "T2.1"`,
  `pnpm nx test shared-ui --filter "T2.1"` (**Needs** T1.5 for localized names).

### T2.2 Dynamic form renderer

- **Goal:** render any `RequestType` as a sectioned Signal Form with schema-driven validation.
- **Concepts:** Signal Forms (`form`, `schema`, `required`, `pattern`, `min`, `max`, `validate`,
  `hidden`, `applyWhen`, `[formField]`, `submit`), `model()`, `@switch`, `MatStepper`.
- **Files:** `libs/shared/util-forms/src/lib/request-form-schema.ts`,
  `libs/shared/ui-dynamic-form/src/lib/dynamic-form/*`, the submit part of
  `libs/applicant/feature-submit/src/lib/submit-page/*`.
- **Acceptance:** conditional fields appear/disappear and never block submission while hidden;
  date ranges ending before they start are rejected; 422 errors from the API show per field.
- **Specs:** `pnpm nx test shared-util-forms --filter "T2.2"`,
  `pnpm nx test shared-ui-dynamic-form --filter "T2.2"` (**Needs** T1.5).
- **Why a separate lib:** the renderer is reused by the admin live preview (T4.4), and features
  may not import other features, so it lives in `shared/ui-dynamic-form` instead of
  `applicant/feature-submit`.

### T2.3 Drafts and autosave

- **Goal:** open or create a draft, autosave it while the user types, guard unsaved changes.
- **Concepts:** SignalStore `rxMethod`, `toObservable` + `debounceTime`, `linkedSignal`,
  `CanDeactivateFn`, `MatDialog`.
- **Files:** `libs/applicant/data-access/src/lib/{applicant-api,applicant.store}.ts`,
  `libs/applicant/feature-submit/src/lib/{submit-page/*,unsaved-changes.guard.ts}`,
  `libs/shared/ui/src/lib/confirm-dialog/*`.
- **Specs:** `pnpm nx run-many -t test --filter "T2.3"`.

### T2.4 Uploads

- **Goal:** drag-and-drop uploads with progress, cancel and client-side validation.
- **Concepts:** `reportProgress` HTTP events, outputs, unsubscribe-to-cancel.
- **Files:** `libs/shared/util-forms/src/lib/file-validation.ts`,
  `libs/shared/ui/src/lib/file-dropzone/*`, `libs/applicant/data-access/src/lib/upload.service.ts`,
  the attachment methods of `applicant.store.ts`, the attachments card of the submit page.
- **Specs:** `pnpm nx run-many -t test --filter "T2.4"`.
- **Note:** MSW answers uploads without real network progress, so the bar may jump straight to
  done in the browser; the spec drives progress events explicitly.

### T2.5 My requests

- **Goal:** a table whose filters, search and page live in the URL.
- **Concepts:** router input binding for query params, `numberAttribute`, `effect`,
  `router.navigate` with `queryParamsHandling: 'merge'`, `MatTable`, a pure pipe with an argument.
- **Files:** `libs/applicant/feature-my-requests/src/lib/my-requests-page/*`,
  `libs/shared/util-common/src/lib/sla-countdown.pipe.ts`, `libs/shared/ui/src/lib/status-chip/*`,
  `loadMyRequests` in `applicant.store.ts`.
- **Specs:** `pnpm nx run-many -t test --filter "T2.5"`.

### T2.6 Request detail and timeline

- **Goal:** a resolver-backed detail page shared by every role, with a status `@switch` and the
  "returned for changes" flow back into the submit page.
- **Concepts:** `ResolveFn`, `forkJoin`/`switchMap`, `@switch`, derived view models.
- **Files:** `libs/requests/feature-detail/src/lib/{request-detail-api,request-detail.resolver}.ts`,
  `libs/requests/feature-detail/src/lib/request-detail-page/*`, `libs/shared/ui/src/lib/timeline/*`,
  the returned notice in the submit page.
- **Specs:** `pnpm nx test requests-feature-detail --filter "T2.6"`,
  `pnpm nx test shared-ui --filter "T2.6"` (**Needs** T1.5, T1.6).

## Phase 3: Reviewer and approver (classic NgRx Store)

### T3.1 Actions and reducer

- **Goal:** the inbox slice with `createActionGroup` and an `@ngrx/entity` adapter, including an
  optimistic decision with rollback.
- **Files:** `libs/review/data-access/src/lib/{inbox.actions,inbox.reducer}.ts`.
- **Specs:** `pnpm nx test review-data-access --filter "T3.1"`.

### T3.2 Selectors

- **Goal:** memoized selectors and a single view-model selector.
- **Files:** `libs/review/data-access/src/lib/inbox.selectors.ts`.
- **Specs:** `pnpm nx test review-data-access --filter "T3.2"` (**Needs** T3.1).

### T3.3 Effects

- **Goal:** load, claim, decide and bulk-decide effects, plus `provideReviewState()`.
- **Concepts:** functional effects, flattening operators, error isolation, `concatLatestFrom`.
- **Files:** `libs/review/data-access/src/lib/{inbox.effects,review-api,provide-review-state}.ts`.
- **Specs:** `pnpm nx test review-data-access --filter "T3.3"`.

### T3.4 Inbox page

- **Goal:** `MatTable` with sort, paginator, selection and approver-only bulk decisions.
- **Files:** `libs/review/feature-inbox/src/lib/inbox-page/*`.
- **Specs:** `pnpm nx test review-feature-inbox --filter "T3.4"` (**Needs** T3.1, T3.2, T1.6).

### T3.5 Decision panel

- **Goal:** typed Reactive Forms with a conditionally required justification and server-side
  422 feedback copied onto the controls.
- **Files:** `libs/review/feature-decision/src/lib/decision-panel/*`; add the `actions` outlet to
  the detail page and its child route in `app.routes.ts`.
- **Specs:** `pnpm nx test review-feature-decision --filter "T3.5"` (**Needs** T3.1, T3.2).

### T3.6 SLA badge

- **Goal:** a ticking countdown with ok / warning / overdue states and clean teardown.
- **Files:** `libs/shared/ui/src/lib/sla-badge/*`.
- **Specs:** `pnpm nx test shared-ui --filter "T3.6"` (**Needs** T2.5).

## Phase 4: Admin (Reactive Forms deep dive and legacy patterns)

### T4.1 Type designer

- **Goal:** a nested `FormArray` form for sections, fields and steps with CDK drag-and-drop.
- **Files:** `libs/admin/feature-type-designer/src/lib/{request-types-api.ts,type-list-page/*,type-designer-page/*}`.
- **Specs:** `pnpm nx test admin-feature-type-designer --filter "T4.1"` (the save spec **Needs** T4.3).

### T4.2 ControlValueAccessors

- **Goal:** `mo-localized-text-input` (`{ en, ar }`) and `mo-options-list-editor` (`FieldOption[]`).
- **Files:** `libs/shared/util-forms/src/lib/{localized-text-input,options-list-editor}/*`.
- **Specs:** `pnpm nx test shared-util-forms --filter "T4.2"`.

### T4.3 Validators

- **Goal:** sync key validators, a cross-field `min <= max` group validator and a debounced async
  "key is available" validator.
- **Files:** `libs/shared/util-forms/src/lib/designer-validators.ts`, their use in the designer.
- **Specs:** `pnpm nx run-many -t test --filter "T4.3"`.

### T4.4 Live preview

- **Goal:** feed the designer's value into your T2.2 renderer. If the preview works, the schema
  contract between admin and applicant holds.
- **Specs:** `pnpm nx test admin-feature-type-designer --filter "T4.4"` (**Needs** T2.2, T4.2).

### T4.5 Users admin

- **Goal:** inline role editing with optimistic updates and rollback, in a component-scoped
  SignalStore.
- **Files:** `libs/admin/feature-users/src/lib/*`.
- **Specs:** `pnpm nx test admin-feature-users --filter "T4.5"`.

### T4.6 Legacy module

- **Goal:** build `feature-reports` the NgModule way: `RouterModule.forChild`, constructor DI,
  `*ngIf`/`*ngFor`, the `async` pipe, explicit `OnPush`, manual `subscribe`/`unsubscribe`.
- **Files:** `libs/admin/feature-reports/src/lib/*`. ESLint's standalone and control-flow rules
  are switched off for this lib only.
- **Specs:** `pnpm nx test admin-feature-reports --filter "T4.6"`.
- **Then write your migration notes below.** On a throwaway branch, run Angular's migrations and
  compare the result with your hand-written version:

  ```sh
  pnpm nx g @angular/core:standalone --path libs/admin/feature-reports --mode convert-to-standalone
  pnpm nx g @angular/core:standalone --path libs/admin/feature-reports --mode prune-ng-modules
  pnpm nx g @angular/core:control-flow --path libs/admin/feature-reports
  pnpm nx g @angular/core:inject --path libs/admin/feature-reports
  ```

  #### My T4.6 migration notes

  _What changed, what the schematics could not do, and what you would do by hand._

## Phase 5: Real-time (RxJS heavy)

### T5.1 RealtimeService

- **Goal:** one typed WebSocket stream with reconnect/backoff and a status signal, connected
  while a session exists.
- **Files:** `libs/core/realtime/src/lib/{realtime.service,provide-realtime-connection}.ts`,
  `app.config.ts`.
- **Specs:** `pnpm nx test core-realtime --filter "T5.1"`.

### T5.2 Routing events

- **Goal:** realtime events update the review store (effect), the applicant store and the
  notifications store (SignalStore hooks).
- **Files:** `realtimeUpdates$` and the `Request Updated/Assigned` reducer cases in
  `review/data-access`, `withHooks` in `applicant.store.ts` and `notifications.store.ts`.
- **Specs:** `pnpm nx run-many -t test --filter "T5.2"` (**Needs** T5.1 for the browser; the
  specs fake the service).

### T5.3 Notification center

- **Goal:** unread badge, mark read / mark all read, toasts for high-priority kinds.
- **Files:** `libs/notifications/data-access/src/lib/*`, `libs/notifications/feature-center/src/lib/*`.
- **Specs:** `pnpm nx run-many -t test --filter "T5.3"`.

### T5.4 Presence

- **Goal:** "Sara is also viewing this request". Open the same request in two tabs as two users
  (see the README) to see it live.
- **Files:** `libs/requests/feature-detail/src/lib/presence-indicator/*`.
- **Specs:** `pnpm nx test requests-feature-detail --filter "T5.4"`.

## Phase 6: Quality and polish

### T6.1 Audit log

- **Goal:** server-side filters, infinite loading in a CDK virtual scroll viewport, and a step
  filter that resets with `linkedSignal` when the request type changes.
- **Files:** `libs/audit/feature-audit-log/src/lib/*`.
- **Specs:** `pnpm nx test audit-feature-audit-log --filter "T6.1"`.

### T6.2 Performance

- `OnPush` is already the default in Angular 22: search for any `ChangeDetectionStrategy.Eager`
  you added and justify or remove it.
- Check every `@for` `track` expression (stable ids, never the object itself) and every
  `trackBy`/`*cdkVirtualFor`.
- Add `@defer` where it pays: below-the-fold sections, the designer's live preview, heavy dialogs.
  Try `on viewport`, `on idle` and `prefetch on hover`.
- Run `pnpm build` and read the budget report (`apps/portal/project.json` → `budgets`). Keep the
  initial bundle under the 500 kB warning; explain any lazy chunk over 100 kB.

### T6.3 Accessibility

- Implement `moAutofocus` (spec: `pnpm nx test shared-util-common --filter "T6.3"`).
- Focus `<main>` and announce the page title with `LiveAnnouncer` after each navigation (TODO in
  `layout.ts`).
- Announce async results ("12 requests loaded", "Decision saved") with `LiveAnnouncer`.
- Verify the designer's drag-and-drop works from the keyboard and that every icon-only button has
  a translated `aria-label`.

### T6.4 Write your own tests

Pick two components you built and write their specs from scratch: one presentational (inputs and
outputs) and one that talks to a store or HTTP. No pre-written specs exist for this task.

### T6.5 End-to-end test

Write one Playwright test in `apps/portal-e2e/src/`: an applicant submits a request in one browser
context, an approver approves it in a second context, and the applicant sees the new status
without reloading. Run it with `pnpm e2e`. Tip: call `POST /api/dev/reset` first so the data is
predictable.

## Phase 7: .NET backend (separate brief)

`libs/mocks/API.md` is the contract. Add an environment flag that switches the API base URL from
MSW to the real server (an `InjectionToken` read by an interceptor is enough), keep MSW for tests
and demos, and later move `RealtimeService` to SignalR behind the same public API.
