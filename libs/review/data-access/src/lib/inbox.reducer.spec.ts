import { EntityState } from '@ngrx/entity';
import { Action } from '@ngrx/store';
import { ApiError, ServiceRequest } from '@moamala/shared/models';
import { inboxReducer, InboxState } from './inbox.reducer';

interface Shape extends EntityState<ServiceRequest> {
  loading: boolean;
  error: string | null;
  decisionErrors: Record<string, string[]> | null;
}

const request = (id: string, patch: Partial<ServiceRequest> = {}): ServiceRequest => ({
  id,
  refNo: `REF-${id}`,
  typeId: 'rt-1',
  applicantId: 'u-app',
  data: {},
  attachments: [],
  status: 'submitted',
  currentStepId: 'step-1',
  assigneeId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...patch,
});

const act = (type: string, props: object = {}): Action => ({ type: `[Inbox] ${type}`, ...props });

const reduce = (...actions: Action[]): Shape =>
  actions.reduce<InboxState>((state, action) => inboxReducer(state, action), inboxReducer(undefined, { type: '@@init' })) as Shape;

const loaded = [act('Load Inbox'), act('Load Inbox Success', { requests: [request('a'), request('b')] })];

describe('inboxReducer', () => {
  it('T3.1 tracks loading and stores the inbox as entities', () => {
    expect(reduce(act('Load Inbox')).loading).toBe(true);
    const state = reduce(...loaded);
    expect(state.loading).toBe(false);
    expect(state.ids).toEqual(['a', 'b']);
    expect(state.entities['b']?.refNo).toBe('REF-b');
  });

  it('T3.1 records load failures', () => {
    const state = reduce(act('Load Inbox'), act('Load Inbox Failure', { error: 'boom' }));
    expect(state.loading).toBe(false);
    expect(state.error).toBe('boom');
  });

  it('T3.1 applies a successful claim', () => {
    const state = reduce(...loaded, act('Claim Success', { request: request('a', { status: 'in_review', assigneeId: 'u-rev' }) }));
    expect(state.entities['a']?.assigneeId).toBe('u-rev');
  });

  it('T3.1 removes a request optimistically when deciding', () => {
    const state = reduce(...loaded, act('Decide', { requestId: 'a', action: 'approve', comment: 'ok ok ok ok' }));
    expect(state.ids).toEqual(['b']);
    const done = reduce(...loaded, act('Decide', { requestId: 'a', action: 'approve', comment: 'x' }), act('Decide Success', { request: request('a', { status: 'approved' }) }));
    expect(done.ids).toEqual(['b']);
  });

  it('T3.1 rolls back a failed decision and keeps the field errors', () => {
    const error: ApiError = { status: 422, message: 'errors.validation', fieldErrors: { comment: ['validation.minLength'] } };
    const state = reduce(...loaded, act('Decide', { requestId: 'a', action: 'reject', comment: 'no' }), act('Decide Failure', { requestId: 'a', error }));
    expect(state.entities['a']?.refNo).toBe('REF-a');
    expect(state.ids).toContain('a');
    expect(state.decisionErrors).toEqual({ comment: ['validation.minLength'] });
    const retry = inboxReducer(state, act('Decide', { requestId: 'a', action: 'reject', comment: 'no' })) as Shape;
    expect(retry.decisionErrors).toBeNull();
  });

  it('T3.1 removes requests decided in bulk', () => {
    const state = reduce(...loaded, act('Bulk Decide Success', { response: { updated: [request('b', { status: 'approved' })], failed: [] } }));
    expect(state.ids).toEqual(['a']);
  });

  it('T5.2 applies realtime updates and assignments', () => {
    let state = reduce(...loaded, act('Request Updated', { request: request('c') }));
    expect(state.ids).toContain('c');
    state = inboxReducer(state, act('Request Updated', { request: request('a', { status: 'approved' }) })) as Shape;
    expect(state.ids).not.toContain('a');
    state = inboxReducer(state, act('Request Assigned', { requestId: 'b', assigneeId: 'u-2' })) as Shape;
    expect(state.entities['b']?.assigneeId).toBe('u-2');
  });
});
