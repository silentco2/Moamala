import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RealtimeService } from '@moamala/core/realtime';
import {
  ApiError,
  Attachment,
  Page,
  RealtimeEvent,
  RequestType,
  ServiceRequest,
} from '@moamala/shared/models';
import { filter, Subject } from 'rxjs';
import { ApplicantStore } from './applicant.store';

const request = (id: string, patch: Partial<ServiceRequest> = {}): ServiceRequest => ({
  id,
  refNo: `REF-${id}`,
  typeId: 'rt-1',
  applicantId: 'u-app-1',
  data: {},
  attachments: [],
  status: 'draft',
  currentStepId: null,
  assigneeId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...patch,
});

const type = { id: 'rt-1', key: 'test_type' } as RequestType;
const attachment: Attachment = {
  id: 'att-1',
  name: 'a.pdf',
  size: 1,
  mime: 'application/pdf',
  url: '/x',
};

function setup() {
  const events = new Subject<RealtimeEvent>();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: RealtimeService,
        useValue: { on: (kind: string) => events.pipe(filter((event) => event.type === kind)) },
      },
    ],
  });
  return {
    store: TestBed.inject(ApplicantStore),
    httpMock: TestBed.inject(HttpTestingController),
    events,
  };
}

/** Waits a few microtasks for a request issued after an awaited step. */
async function nextRequest(httpMock: HttpTestingController, url: string) {
  for (let tick = 0; tick < 20; tick++) {
    const [req] = httpMock.match(url);
    if (req) return req;
    await Promise.resolve();
  }
  return httpMock.expectOne(url);
}

async function withDraft() {
  const context = setup();
  const opened = context.store.openDraft({ requestId: 'req-1' });
  context.httpMock.expectOne('/api/requests/req-1').flush(request('req-1'));
  (await nextRequest(context.httpMock, '/api/request-types/rt-1')).flush(type);
  await opened;
  return context;
}

describe('ApplicantStore', () => {
  it('T2.5 loads my requests for a query', () => {
    const { store, httpMock } = setup();
    store.loadMyRequests({ page: 2, pageSize: 10, status: 'returned' });
    expect(store.loading()).toBe(true);
    const req = httpMock.expectOne((r) => r.url === '/api/requests');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('status')).toBe('returned');
    expect(req.request.params.has('q')).toBe(false);
    req.flush({
      items: [request('a'), request('b')],
      total: 12,
      page: 2,
      pageSize: 10,
    } satisfies Page<ServiceRequest>);
    expect(store.requests().map((item) => item.id)).toEqual(['a', 'b']);
    expect(store.total()).toBe(12);
    expect(store.loading()).toBe(false);
    expect(store.query()).toEqual({ page: 2, pageSize: 10, status: 'returned' });
  });

  it('T2.5 cancels a stale list request when the query changes', () => {
    const { store, httpMock } = setup();
    store.loadMyRequests({ page: 1, pageSize: 10 });
    store.loadMyRequests({ page: 2, pageSize: 10 });
    const [first, second] = httpMock.match((r) => r.url === '/api/requests');
    expect(first.cancelled).toBe(true);
    second.flush({ items: [request('z')], total: 1, page: 2, pageSize: 10 });
    expect(store.requests().map((item) => item.id)).toEqual(['z']);
  });

  it('T2.3 opens an existing request with its type', async () => {
    const { store } = await withDraft();
    expect(store.draft()?.id).toBe('req-1');
    expect(store.draftType()).toEqual(type);
  });

  it('T2.3 creates a draft for a new request', async () => {
    const { store, httpMock } = setup();
    const opened = store.openDraft({ typeId: 'rt-1' });
    const create = httpMock.expectOne('/api/requests');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ typeId: 'rt-1' });
    create.flush(request('req-new'));
    (await nextRequest(httpMock, '/api/request-types/rt-1')).flush(type);
    await opened;
    expect(store.draft()?.id).toBe('req-new');
  });

  it('T2.3 saves the draft and records when it was saved', async () => {
    const { store, httpMock } = await withDraft();
    store.saveDraft({ fullName: 'Omar' });
    expect(store.savingDraft()).toBe(true);
    const req = httpMock.expectOne('/api/requests/req-1/draft');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ data: { fullName: 'Omar' }, attachments: [] });
    req.flush(request('req-1', { data: { fullName: 'Omar' }, updatedAt: '2026-02-02T10:00:00Z' }));
    expect(store.savingDraft()).toBe(false);
    expect(store.savedAt()).toBe('2026-02-02T10:00:00Z');
    expect(store.draft()?.data).toEqual({ fullName: 'Omar' });
  });

  it('T2.3 submits the draft', async () => {
    const { store, httpMock } = await withDraft();
    const submitted = store.submit();
    httpMock
      .expectOne('/api/requests/req-1/submit')
      .flush(request('req-1', { status: 'submitted' }));
    expect((await submitted).status).toBe('submitted');
    expect(store.draft()?.status).toBe('submitted');
  });

  it('T2.3 rejects with the API field errors when submit fails validation', async () => {
    const { store, httpMock } = await withDraft();
    const submitted = store.submit();
    const body: ApiError = {
      status: 422,
      message: 'errors.validation',
      fieldErrors: { fullName: ['validation.required'] },
    };
    httpMock
      .expectOne('/api/requests/req-1/submit')
      .flush(body, { status: 422, statusText: 'Unprocessable' });
    await expect(submitted).rejects.toEqual(body);
  });

  it('T2.4 adds and removes attachments on the draft', async () => {
    const { store } = await withDraft();
    store.addAttachment(attachment);
    expect(store.draft()?.attachments).toEqual([attachment]);
    store.removeAttachment('att-1');
    expect(store.draft()?.attachments).toEqual([]);
  });

  it('T5.2 applies realtime updates to matching requests', () => {
    const { store, httpMock, events } = setup();
    store.loadMyRequests({ page: 1, pageSize: 10 });
    httpMock
      .expectOne((r) => r.url === '/api/requests')
      .flush({
        items: [request('a'), request('b', { status: 'in_review' })],
        total: 2,
        page: 1,
        pageSize: 10,
      });
    events.next({ type: 'request.updated', request: request('b', { status: 'approved' }) });
    events.next({ type: 'request.updated', request: request('other', { status: 'approved' }) });
    expect(store.requests().map((item) => item.status)).toEqual(['draft', 'approved']);
  });
});
