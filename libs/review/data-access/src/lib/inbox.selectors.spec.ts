import { Action } from '@ngrx/store';
import { ServiceRequest } from '@moamala/shared/models';
import { INBOX_FEATURE_KEY, inboxReducer, InboxState } from './inbox.reducer';
import {
  selectDecisionErrors,
  selectInboxRequests,
  selectInboxViewModel,
  selectOverdueRequests,
  selectRequestById,
} from './inbox.selectors';

const request = (id: string, dueAt: string | undefined, assigneeId: string | null = null) =>
  ({ id, refNo: id, status: 'submitted', dueAt, assigneeId }) as ServiceRequest;

const REQUESTS = [
  request('late', '2026-03-01T10:00:00Z', 'u-1'),
  request('none', undefined),
  request('early', '2026-02-01T10:00:00Z'),
];

function rootState(...extra: Action[]) {
  const actions: Action[] = [{ type: '[Inbox] Load Inbox Success', requests: REQUESTS } as Action, ...extra];
  const inbox = actions.reduce<InboxState>((state, action) => inboxReducer(state, action), inboxReducer(undefined, { type: '@@init' }));
  return { [INBOX_FEATURE_KEY]: inbox };
}

describe('inbox selectors', () => {
  it('T3.2 sorts requests by due date, undated last', () => {
    expect(selectInboxRequests(rootState()).map((item) => item.id)).toEqual(['early', 'late', 'none']);
  });

  it('T3.2 selects overdue requests relative to now', () => {
    const now = Date.parse('2026-02-15T00:00:00Z');
    expect(selectOverdueRequests(now)(rootState()).map((item) => item.id)).toEqual(['early']);
  });

  it('T3.2 selects a request by id', () => {
    expect(selectRequestById('late')(rootState())?.assigneeId).toBe('u-1');
  });

  it('T3.2 builds a memoized view model', () => {
    const state = rootState();
    const vm = selectInboxViewModel(state);
    expect(vm).toMatchObject({ loading: false, error: null, total: 3, unclaimedCount: 2 });
    expect(vm.requests.map((item) => item.id)).toEqual(['early', 'late', 'none']);
    expect(selectInboxViewModel(state)).toBe(vm);
  });

  it('T3.2 exposes the field errors of a failed decision', () => {
    const state = rootState(
      { type: '[Inbox] Decide', requestId: 'early', action: 'reject', comment: 'x' } as Action,
      {
        type: '[Inbox] Decide Failure',
        requestId: 'early',
        error: { status: 422, message: 'errors.validation', fieldErrors: { comment: ['validation.required'] } },
      } as Action,
    );
    expect(selectDecisionErrors(state)).toEqual({ comment: ['validation.required'] });
  });
});
