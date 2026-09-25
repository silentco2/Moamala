# Mo'amala API contract

This is the contract the mock backend (MSW, `libs/mocks`) implements today and a future .NET API
must implement 1:1. All types live in `libs/shared/models`; field names below match them exactly.

## Conventions

- Base path: `/api`. JSON in and out (`Content-Type: application/json`), except uploads.
- Timestamps are ISO 8601 UTC strings (`2026-09-25T10:42:00.000Z`); calendar dates are `yyyy-mm-dd`.
- Localized text is `Localized` = `{ "en": string, "ar": string }`.
- **Auth**: `Authorization: Bearer <token>` on every endpoint except the public ones marked below.
  The token is JWT-shaped (`header.payload.signature`); the mock does not sign it.
- **Errors**: every non-2xx response has an `ApiError` body. `message` is a translation key
  (`errors.*`); 422 responses add `fieldErrors` with translation keys per field (`validation.*`).

```json
{ "status": 422, "message": "errors.validation", "fieldErrors": { "comment": ["validation.required"] } }
```

| Status | Meaning                                                                 |
| ------ | ----------------------------------------------------------------------- |
| 401    | Missing, malformed or expired token (`errors.unauthorized`)             |
| 403    | Authenticated, but the role or ownership does not allow it (`errors.forbidden`) |
| 404    | Unknown resource (`errors.notFound`)                                    |
| 409    | State conflict, e.g. already claimed (`errors.alreadyClaimed`)          |
| 422    | Validation failed; see `fieldErrors`                                    |
| 500    | Server error (`errors.server`); the mock produces these on purpose in chaos mode |

- **Paging**: list endpoints return `Page<T>` = `{ items, total, page, pageSize }`. `page` is 1-based.
- **Sorting**: `sort=field:direction`, e.g. `createdAt:desc`.

## Auth

| Method | Path                  | Roles  | Body           | Response                     |
| ------ | --------------------- | ------ | -------------- | ---------------------------- |
| GET    | `/auth/demo-users`    | public | –              | `User[]` (demo login screen) |
| POST   | `/auth/login`         | public | `LoginRequest` | `LoginResponse`              |
| GET    | `/auth/me`            | any    | –              | `User`                       |

- `POST /auth/login` with `{ "email": "sara@reviewer.demo" }`. Unknown email: 401
  `errors.invalidCredentials`; empty email: 422 `{ email: ['validation.required'] }`.
- Tokens expire after 8 hours.

## Request types

| Method | Path                                  | Roles | Body / query                | Response             |
| ------ | ------------------------------------- | ----- | --------------------------- | -------------------- |
| GET    | `/request-types`                      | any   | `?active=true`              | `RequestType[]`      |
| GET    | `/request-types/:id`                  | any   | –                           | `RequestType`        |
| GET    | `/request-types/key-availability`     | admin | `?key=...&excludeId=...`    | `KeyAvailability`    |
| POST   | `/request-types`                      | admin | `RequestTypeInput`          | 201 `RequestType`    |
| PUT    | `/request-types/:id`                  | admin | `RequestTypeInput`          | `RequestType`        |
| DELETE | `/request-types/:id`                  | admin | –                           | 204 (soft delete: `active = false`) |

- Applicants always receive active types only.
- `POST`/`PUT` validate and answer 422 with keys such as `key`, `name`, `fields`, `steps`,
  `fields.<index>.key`, `fields.<index>.max`, `steps.<index>.slaHours`. Type keys match
  `TYPE_KEY_PATTERN` (snake_case) and must be unique; field keys match `FIELD_KEY_PATTERN`
  (camelCase) and must be unique within the type.
- `PUT` increments `version`.

## Requests

| Method | Path                           | Roles              | Body / query        | Response                 |
| ------ | ------------------------------ | ------------------ | ------------------- | ------------------------ |
| GET    | `/requests`                    | any                | `RequestQuery`      | `Page<ServiceRequest>`   |
| GET    | `/requests/:id`                | any (see access)   | –                   | `ServiceRequest`         |
| GET    | `/requests/:id/audit`          | any (see access)   | –                   | `AuditEvent[]` (oldest first) |
| POST   | `/requests`                    | applicant          | `{ typeId }`        | 201 `ServiceRequest` (draft) |
| PUT    | `/requests/:id/draft`          | applicant (owner)  | `{ data, attachments? }` | `ServiceRequest`    |
| POST   | `/requests/:id/submit`         | applicant (owner)  | –                   | `ServiceRequest`         |
| POST   | `/requests/:id/claim`          | reviewer, approver | –                   | `ServiceRequest`         |
| POST   | `/requests/:id/decision`       | reviewer, approver | `DecisionRequest`   | `ServiceRequest`         |
| POST   | `/requests/bulk-decision`      | approver           | `BulkDecisionRequest` | `BulkDecisionResponse` |

**Access**: applicants see only their own requests (including drafts); staff see every
non-draft request.

**`GET /requests` query** (`RequestQuery`): `page` (default 1), `pageSize` (default 10, max 100),
`sort` (default `createdAt:desc`; fields `createdAt`, `updatedAt`, `dueAt`, `refNo`, `status`),
`status`, `typeId`, `q` (matches the reference number or any value in `data`), and
`assignee=me`, which returns the caller's work inbox: requests in `submitted`/`in_review` whose
current step belongs to the caller's role and that are unclaimed or claimed by the caller.

**Workflow**

```
draft ──submit──▶ submitted ──claim──▶ in_review ──forward──▶ submitted (next step)
  ▲                                         │──approve──▶ approved   (last step; earlier steps: forward)
  │                                         │──reject───▶ rejected
  └───────── returned ◀──────return─────────┘
returned ──submit──▶ submitted (back at the first step)
```

- `submit`: allowed from `draft` and `returned`. Validates `data` against the type's fields
  (required/pattern/min/max/select options/date range, skipping fields hidden by `visibleIf`)
  and answers 422 with field keys. On success the request enters the first step with
  `dueAt = now + step.slaHours`, and everyone with that step's role is notified.
- `claim`: the request must be in the caller's inbox. Already claimed by someone else: 409
  `errors.alreadyClaimed`; otherwise not allowed: 403.
- `decision`: the caller must have claimed the request (409 `errors.notClaimed`) and hold the
  step's role (403). 422 when the action is not in `step.actions`, when `forward` is used on the
  last step, or when `comment` is empty (`validation.required`) or shorter than 10 characters
  (`validation.minLength`) for any action other than `forward`.
- `bulk-decision`: `action` is `approve` or `reject`; unclaimed inbox items are claimed
  automatically. Items that cannot be decided are reported in `failed` instead of failing the call.

## Uploads

| Method | Path            | Roles     | Body                              | Response          |
| ------ | --------------- | --------- | --------------------------------- | ----------------- |
| POST   | `/uploads`      | applicant | `multipart/form-data`, field `file` | 201 `Attachment` |
| GET    | `/uploads/:id`  | public    | –                                 | file content      |

- Limits: `UPLOAD_MAX_BYTES` (5 MB), `UPLOAD_ALLOWED_MIME` (PDF, PNG, JPEG). Violations answer 422
  `{ file: ['validation.fileSize' | 'validation.fileType'] }`.
- The mock waits an extra 1.5 s so progress UI is visible.
- A `file` field in `ServiceRequest.data` holds the id of one of the request's `attachments`.

## Notifications

| Method | Path                        | Roles | Body             | Response              |
| ------ | --------------------------- | ----- | ---------------- | --------------------- |
| GET    | `/notifications`            | any   | –                | `AppNotification[]` (newest first, own only) |
| PATCH  | `/notifications/:id`        | any   | `{ read: true }` | `AppNotification`     |
| POST   | `/notifications/read-all`   | any   | –                | 204                   |

Kinds: `request.submitted`, `request.assigned`, `request.returned`, `request.approved`,
`request.rejected`, `sla.warning`, `sla.breached`. `HIGH_PRIORITY_KINDS` should also surface as a
toast. `payload` carries `requestId` and `refNo`.

## Audit

| Method | Path     | Roles | Query        | Response            |
| ------ | -------- | ----- | ------------ | ------------------- |
| GET    | `/audit` | admin | `AuditQuery` | `Page<AuditEvent>` (newest first, `pageSize` default 50) |

Filters: `requestId`, `actorId`, `action`, `typeId`, `stepId`, `from`, `to` (dates, inclusive).
Events not tied to a request (`type_created`, `type_updated`, `role_changed`) have `requestId: ''`.

## Users

| Method | Path               | Roles | Body                    | Response |
| ------ | ------------------ | ----- | ----------------------- | -------- |
| GET    | `/users`           | any   | –                       | `User[]` (names are shown on timelines) |
| PATCH  | `/users/:id/role`  | admin | `UpdateUserRoleRequest` | `User`   |

Changing your own role answers 422 `{ role: ['validation.ownRole'] }`.

## Reports

| Method | Path               | Roles | Response        |
| ------ | ------------------ | ----- | --------------- |
| GET    | `/reports/summary` | admin | `ReportSummary` |

## Dev helpers (mock only)

| Method | Path          | Description                                  |
| ------ | ------------- | -------------------------------------------- |
| POST   | `/dev/reset`  | Restores the seed data in every open tab     |

## Realtime

- URL: `ws://localhost/realtime?token=<token>`. An invalid token closes the socket with code 4401.
- Server → client messages are JSON `RealtimeEvent`s:

| `type`             | Payload                          | Sent to                                     |
| ------------------ | -------------------------------- | ------------------------------------------- |
| `request.updated`  | `{ request }`                    | the request's applicant and all staff        |
| `request.assigned` | `{ requestId, assigneeId }`      | staff                                        |
| `notification`     | `{ notification }`               | the notification's user                      |
| `presence`         | `{ requestId, userIds }`         | everyone (clients filter by `requestId`)     |

- Client → server messages are JSON `RealtimeClientMessage`s: `presence.join` and
  `presence.leave` with a `requestId`. Closing the socket leaves every request.
- The mock pushes an event for every mutation above. MSW shares socket clients across tabs, so
  events reach sockets opened in other tabs of the same browser; the in-memory database is
  synced between tabs with a `BroadcastChannel`.
- A simulator adds background activity every 45–90 s in the visible tab: new submissions and
  `sla.warning` / `sla.breached` notifications.

## Mock-only behavior

| Setting                            | Effect                                                   |
| ---------------------------------- | -------------------------------------------------------- |
| always                             | 200–800 ms latency on every `/api` call                  |
| `localStorage.mockChaos = '0.1'`   | ~10% of API calls fail with 500 (not `/api/dev/*`)       |
| `localStorage.mockSimulator = 'off'` | disables the realtime simulator                        |
| `moamalaMocks.reset()` (console)   | restores the seed data and reloads                        |
