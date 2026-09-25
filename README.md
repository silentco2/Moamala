# Mo'amala (معاملة)

A bilingual (English/Arabic, full RTL) permit and approval workflow platform in the style of
government e-services. Admins design request types (a form schema plus an approval workflow),
applicants submit requests, reviewers and approvers process them through SLA-bound steps, and
everyone gets real-time updates.

**This is a learning project.** The workspace, styles, templates, translations, domain types and
a complete mock backend are done. Every piece of Angular logic is a `TODO(Tx.y)` for you to write,
guided by [`TASKS.md`](TASKS.md) and by specs that fail until you implement each task.

## Quick start

```sh
corepack enable              # provides the pinned pnpm version
pnpm install
pnpm start                   # http://localhost:4200
```

On day one the app boots to a static login page backed by the mock API. Features come alive as you
complete the tasks. **Start with T1.1** in `apps/portal/src/app/app.config.ts`:

```sh
pnpm nx test portal --filter "T1.1"
```

## Scripts

| Command                                    | What it does                                                          |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `pnpm start`                               | Dev server with the MSW mock backend                                  |
| `pnpm build`                               | Production build (the mock backend is excluded)                       |
| `pnpm test`                                | All specs (they fail until the matching task is done)                 |
| `pnpm nx test <project> --filter "T2.3"`   | Specs of one task in one project                                      |
| `pnpm nx run-many -t test --filter "T2\."` | Every spec of a phase                                                 |
| `pnpm lint`                                | ESLint, including Nx module boundaries                                |
| `pnpm e2e`                                 | Playwright (you write the test in T6.5)                               |
| `pnpm typecheck`                           | AOT-compiles every library's templates in a few seconds               |
| `pnpm i18n:check`                          | `en.json`/`ar.json` parity and template key references                |
| `pnpm verify`                              | lint + build + typecheck + i18n check + Prettier check (what CI runs) |

## Demo accounts

Pick one on the login page (or type the email). There is no password.

| Role      | Name (EN / AR)                    | Email                  |
| --------- | --------------------------------- | ---------------------- |
| Applicant | Omar Haddad / عمر حداد            | `omar@applicant.demo`  |
| Applicant | Layla Nasser / ليلى ناصر          | `layla@applicant.demo` |
| Reviewer  | Sara Al-Mansouri / سارة المنصوري  | `sara@reviewer.demo`   |
| Reviewer  | Khalid Farouk / خالد فاروق        | `khalid@reviewer.demo` |
| Approver  | Mona Youssef / منى يوسف           | `mona@approver.demo`   |
| Approver  | Faisal Al-Qahtani / فيصل القحطاني | `faisal@approver.demo` |
| Admin     | Huda Saleh / هدى صالح             | `huda@admin.demo`      |
| Admin     | Tariq Ibrahim / طارق إبراهيم      | `tariq@admin.demo`     |

The seed has three request types (Building Permit: 3 steps, uploads; Commercial License Renewal:
conditional fields; Public Event Permit: date-range validation) and 40 requests across every
status, with overdue and near-due SLAs.

## Mock backend

`libs/mocks` is a full in-browser backend built on [MSW](https://mswjs.io): REST under `/api`, a
WebSocket at `ws://localhost/realtime`, auth with 401/403, 422 validation errors, and an in-memory
database persisted to `localStorage`. It only loads in development (`isDevMode()` in
`apps/portal/src/main.ts`). Every endpoint is documented in
[`libs/mocks/API.md`](libs/mocks/API.md), the contract a future .NET API will implement.

| To…                                    | Do this in the browser console                            |
| -------------------------------------- | --------------------------------------------------------- |
| Reset the demo data                    | `moamalaMocks.reset()` (or `POST /api/dev/reset`)         |
| Make ~10% of API calls fail with 500   | `localStorage.mockChaos = '0.1'` (remove the key to stop) |
| Stop the background activity simulator | `localStorage.mockSimulator = 'off'`                      |

Every call has 200–800 ms of latency, so loading states are visible.

### Two tabs, two roles (real time)

The session lives in `sessionStorage` (per tab), while the mock database and the socket clients are
shared by every tab of the same browser profile (`localStorage` + `BroadcastChannel`). So two tabs
can be two users talking to one backend:

1. Tab A: sign in as **Omar** (applicant) and open one of his submitted requests.
2. Tab B: sign in as **Sara** (reviewer), open the same request from the inbox, claim it and
   return it with a comment.
3. Tab A updates immediately: status banner, notification badge, toast. With T5.4 done, each tab
   also shows that the other user is viewing the request.

Separate browser profiles or private windows get their own, independent mock backend.

## Workspace

Nx integrated monorepo, one app (`apps/portal`) and libraries grouped by domain. Each library
exposes a single `src/index.ts`.

```
apps/portal                    app shell, config, routes, MSW bootstrap, theme, i18n files
apps/portal-e2e                Playwright setup (T6.5)
libs/shared/models             domain types and API DTOs (the contract)
libs/shared/ui                 presentational components
libs/shared/ui-dynamic-form    schema-driven Signal Forms renderer (T2.2, reused in T4.4)
libs/shared/util-forms         validators and ControlValueAccessors
libs/shared/util-common        pipes, directives, injection tokens
libs/core/{auth,i18n,realtime,layout}
libs/applicant/{data-access,feature-catalog,feature-submit,feature-my-requests}
libs/requests/feature-detail   request detail shared by all roles
libs/review/{data-access,feature-inbox,feature-decision}   classic NgRx Store
libs/admin/{feature-type-designer,feature-users,feature-reports}   feature-reports is NgModule-based
libs/notifications/{data-access,feature-center}
libs/audit/feature-audit-log
libs/mocks                     MSW handlers, seed, realtime simulator
```

Module boundaries (enforced by `@nx/enforce-module-boundaries`):

- `type:feature` → `data-access`, `ui`, `util`, `model`; `type:ui` → `ui`, `util`, `model`;
  `type:data-access` → `data-access`, `util`, `model`; `type:util` → `util`, `model`.
- A domain scope may use `shared`, `core` and itself; `core` may use `shared`; nothing but the
  app may import `mocks`.

## Stack and versions

Verified against npm on 2026-09-25 and pinned:

| Package                                                     | Version                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Angular, Angular Material, CDK                              | 22.2                                                                      |
| Nx                                                          | 23.2.1                                                                    |
| NgRx (store, effects, entity, devtools, signals, operators) | 22.0.1                                                                    |
| @jsverse/transloco                                          | 8.4                                                                       |
| MSW                                                         | 2.15                                                                      |
| TypeScript                                                  | 6.0 (Angular 22 requires `>=6.0 <6.1`; TypeScript 7 is not supported yet) |
| Vitest (via `@angular/build:unit-test`)                     | 4.1                                                                       |
| Playwright                                                  | 1.x                                                                       |

### Deviations from the original brief

- **Package manager:** pnpm. npm 10.9 crashed while resolving the Angular 22 peer tree
  (`Cannot read properties of null (reading 'edgesOut')`).
- **Unit tests:** Nx's `vitest-angular` runner only supports buildable libraries, so each library
  gets a `test` target that runs Angular's built-in `@angular/build:unit-test` builder against the
  portal build configuration. Filter with `--filter "T3.4"`; the builder has no `-t` flag.
- **Animations:** `provideAnimationsAsync()` is deprecated since Angular 20.2 and Material 22 does
  not need it, so T1.1 leaves it out.
- **OnPush:** it is the default change detection in Angular 22, so T6.2 is an audit rather than
  adding `OnPush` everywhere.
- **Extra library:** `libs/shared/ui-dynamic-form` holds the dynamic form renderer so the admin
  live preview can reuse it without a feature-to-feature import.
- **Aggregate type:** `RequestDetail` (request + type + audit events + users) was added to
  `shared/models` so the review feature can type the resolved route data without importing the
  requests feature.
- **Realtime auth:** the socket authenticates with a `token` query parameter.

## Continuous integration

`.github/workflows/ci.yml` runs `pnpm verify` (lint, build, typecheck, i18n check, formatting). Specs are
not part of CI on purpose: they fail until you implement each task, and `pnpm test` is your
progress meter.
