import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { RealtimeService } from '@moamala/core/realtime';
import { RealtimeEvent, ServiceRequest } from '@moamala/shared/models';
import { filter, Observable, of, Subject } from 'rxjs';
import { bulkDecide$, claim$, decide$, loadInbox$, realtimeUpdates$ } from './inbox.effects';
import { INBOX_FEATURE_KEY, inboxReducer } from './inbox.reducer';

const request = (id: string, patch: Partial<ServiceRequest> = {}) =>
  ({ id, refNo: id, status: 'submitted', assigneeId: null, ...patch }) as ServiceRequest;

function setup(action: Action) {
  const events = new Subject<RealtimeEvent>();
  const inbox = inboxReducer(undefined, {
    type: '[Inbox] Load Inbox Success',
    requests: [request('a'), request('b')],
  } as Action);
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideMockActions(() => of(action)),
      provideMockStore({ initialState: { [INBOX_FEATURE_KEY]: inbox } }),
      {
        provide: RealtimeService,
        useValue: { on: (kind: string) => events.pipe(filter((event) => event.type === kind)) },
      },
    ],
  });
  return { httpMock: TestBed.inject(HttpTestingController), events };
}

function collect(effect: () => Observable<Action>): Action[] {
  const output: Action[] = [];
  TestBed.runInInjectionContext(effect).subscribe((action) => output.push(action));
  return output;
}

const failure = { status: 500, statusText: 'Server Error' };

describe('inbox effects', () => {
  it('T3.3 loadInbox$ loads my inbox', () => {
    const { httpMock } = setup({ type: '[Inbox] Load Inbox' });
    const output = collect(loadInbox$);
    const req = httpMock.expectOne((r) => r.url === '/api/requests');
    expect(req.request.params.get('assignee')).toBe('me');
    expect(req.request.params.get('pageSize')).toBe('100');
    req.flush({ items: [request('x')], total: 1, page: 1, pageSize: 100 });
    expect(output).toEqual([{ type: '[Inbox] Load Inbox Success', requests: [request('x')] }]);
  });

  it('T3.3 loadInbox$ reports failures without dying', () => {
    const { httpMock } = setup({ type: '[Inbox] Load Inbox' });
    const output = collect(loadInbox$);
    httpMock
      .expectOne((r) => r.url === '/api/requests')
      .flush({ status: 500, message: 'errors.server' }, failure);
    expect(output.map((action) => action.type)).toEqual(['[Inbox] Load Inbox Failure']);
  });

  it('T3.3 claim$ claims the request', () => {
    const { httpMock } = setup({ type: '[Inbox] Claim', requestId: 'a' } as Action);
    const output = collect(claim$);
    const req = httpMock.expectOne('/api/requests/a/claim');
    expect(req.request.method).toBe('POST');
    req.flush(request('a', { assigneeId: 'u-1' }));
    expect(output).toEqual([
      { type: '[Inbox] Claim Success', request: request('a', { assigneeId: 'u-1' }) },
    ]);
  });

  it('T3.3 decide$ posts the decision', () => {
    const { httpMock } = setup({
      type: '[Inbox] Decide',
      requestId: 'a',
      action: 'reject',
      comment: 'Not allowed here',
    } as Action);
    const output = collect(decide$);
    const req = httpMock.expectOne('/api/requests/a/decision');
    expect(req.request.body).toEqual({ action: 'reject', comment: 'Not allowed here' });
    req.flush(request('a', { status: 'rejected' }));
    expect(output).toEqual([
      { type: '[Inbox] Decide Success', request: request('a', { status: 'rejected' }) },
    ]);
  });

  it('T3.3 decide$ passes the API validation error to the failure action', () => {
    const { httpMock } = setup({
      type: '[Inbox] Decide',
      requestId: 'a',
      action: 'reject',
      comment: '',
    } as Action);
    const output = collect(decide$);
    const body = {
      status: 422,
      message: 'errors.validation',
      fieldErrors: { comment: ['validation.required'] },
    };
    httpMock
      .expectOne('/api/requests/a/decision')
      .flush(body, { status: 422, statusText: 'Unprocessable' });
    expect(output).toEqual([{ type: '[Inbox] Decide Failure', requestId: 'a', error: body }]);
  });

  it('T3.3 bulkDecide$ only sends requests that are still in the inbox', () => {
    const { httpMock } = setup({
      type: '[Inbox] Bulk Decide',
      requestIds: ['a', 'gone'],
      action: 'approve',
      comment: 'Approved in bulk',
    } as Action);
    const output = collect(bulkDecide$);
    const req = httpMock.expectOne('/api/requests/bulk-decision');
    expect(req.request.body).toEqual({
      requestIds: ['a'],
      action: 'approve',
      comment: 'Approved in bulk',
    });
    req.flush({ updated: [request('a', { status: 'approved' })], failed: [] });
    expect(output[0]?.type).toBe('[Inbox] Bulk Decide Success');
  });

  it('T5.2 realtimeUpdates$ turns realtime events into actions', () => {
    const { events } = setup({ type: 'noop' });
    const output = collect(realtimeUpdates$);
    events.next({ type: 'request.updated', request: request('c') });
    events.next({ type: 'request.assigned', requestId: 'c', assigneeId: 'u-9' });
    events.next({ type: 'presence', requestId: 'c', userIds: [] });
    expect(output).toEqual([
      { type: '[Inbox] Request Updated', request: request('c') },
      { type: '[Inbox] Request Assigned', requestId: 'c', assigneeId: 'u-9' },
    ]);
  });
});
