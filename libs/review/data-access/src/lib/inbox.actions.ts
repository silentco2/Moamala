import { createActionGroup } from '@ngrx/store';

// TODO(T3.1): declare the inbox events with createActionGroup (source 'Inbox'). The specs
//   dispatch these exact action types, so keep the names and payloads:
//     'Load Inbox'            emptyProps()
//     'Load Inbox Success'    { requests: ServiceRequest[] }
//     'Load Inbox Failure'    { error: string }
//     'Claim'                 { requestId: string }
//     'Claim Success'         { request: ServiceRequest }
//     'Claim Failure'         { requestId: string; error: string }
//     'Decide'                { requestId: string; action: DecisionAction; comment: string }
//     'Decide Success'        { request: ServiceRequest }
//     'Decide Failure'        { requestId: string; error: ApiError }
//     'Bulk Decide'           { requestIds: string[]; action: 'approve' | 'reject'; comment: string }
//     'Bulk Decide Success'   { response: BulkDecisionResponse }
//     'Bulk Decide Failure'   { error: string }
//     'Request Updated'       { request: ServiceRequest }                    (realtime, T5.2)
//     'Request Assigned'      { requestId: string; assigneeId: string }      (realtime, T5.2)
//   'Load Inbox Success' becomes the type '[Inbox] Load Inbox Success' and the creator
//   InboxActions.loadInboxSuccess.
//   Hint: an action group is Redux Toolkit's createSlice actions without the reducer attached.
//   Docs: https://ngrx.io/guide/store/action-groups
export const InboxActions = createActionGroup({
  source: 'Inbox',
  events: {},
});
