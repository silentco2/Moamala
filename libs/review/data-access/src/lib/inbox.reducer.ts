import { Action } from '@ngrx/store';

export const INBOX_FEATURE_KEY = 'inbox';

// TODO(T3.1): model the state with @ngrx/entity:
//   interface InboxState extends EntityState<ServiceRequest> {
//     loading: boolean; error: string | null;
//     decisionErrors: Record<string, string[]> | null;   // fieldErrors of the last failed decision
//     stash: Record<string, ServiceRequest>;             // entities removed optimistically
//   }
//   Build `adapter = createEntityAdapter<ServiceRequest>()` and the reducer with createReducer/on:
//   - Load Inbox -> loading; Load Inbox Success -> setAll; Load Inbox Failure -> error
//   - Claim Success -> upsertOne
//   - Decide -> optimistic: remove the entity and keep it in `stash`; clear decisionErrors
//   - Decide Success -> drop it from `stash`
//   - Decide Failure -> rollback: re-add the stashed entity; decisionErrors = error.fieldErrors ?? null
//   - Bulk Decide Success -> removeMany(response.updated ids)
//   - (T5.2) Request Updated -> upsert while status is 'submitted' | 'in_review', otherwise remove
//   - (T5.2) Request Assigned -> update assigneeId when the entity exists
//   Hint: createEntityAdapter is the NgRx twin of Redux Toolkit's createEntityAdapter.
//   Docs: https://ngrx.io/guide/entity/adapter
export type InboxState = object;

export const initialInboxState: InboxState = {};

export function inboxReducer(state: InboxState = initialInboxState, _action: Action): InboxState {
  return state;
}
