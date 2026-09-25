import { Action } from '@ngrx/store';
import { createEffect } from '@ngrx/effects';
import { EMPTY, Observable } from 'rxjs';

// TODO(T3.3): implement the functional effects with createEffect((actions$ = inject(Actions),
//   api = inject(ReviewApi)) => ..., { functional: true }). Map failures to the *Failure actions
//   and never let an error complete the effect stream (catch inside the flattening operator).
//   - loadInbox$:   Load Inbox -> api.inbox() -> Load Inbox Success | Failure   (switchMap)
//   - claim$:       Claim -> api.claim() -> Claim Success | Failure             (mergeMap)
//   - decide$:      Decide -> api.decide() -> Decide Success | Decide Failure with the ApiError
//                   body (HttpErrorResponse.error; fall back to { status, message: 'errors.server' })
//                   (concatMap keeps decisions in order)
//   - bulkDecide$:  Bulk Decide -> concatLatestFrom(() => store.select(selectInboxEntities)) to
//                   drop ids no longer in the inbox -> api.bulkDecide() -> Success | Failure
//   Hint: effects are redux-observable epics (or RTK listener middleware): action in, action out.
//   Docs: https://ngrx.io/guide/effects
export const loadInbox$ = createEffect((): Observable<Action> => EMPTY, { functional: true });

export const claim$ = createEffect((): Observable<Action> => EMPTY, { functional: true });

export const decide$ = createEffect((): Observable<Action> => EMPTY, { functional: true });

export const bulkDecide$ = createEffect((): Observable<Action> => EMPTY, { functional: true });

// TODO(T5.2): map RealtimeService events into the store: 'request.updated' -> Request Updated,
//   'request.assigned' -> Request Assigned (merge the two streams).
//   Docs: https://rxjs.dev/api/index/function/merge
export const realtimeUpdates$ = createEffect((): Observable<Action> => EMPTY, { functional: true });
