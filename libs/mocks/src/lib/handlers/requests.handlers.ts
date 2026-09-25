import { http, HttpResponse } from 'msw';
import {
  Attachment,
  AuditEvent,
  DecisionRequest,
  Page,
  ServiceRequest,
  User,
} from '@moamala/shared/models';
import { recordAudit } from '../audit-log';
import { db } from '../db/db';
import { notifyRole } from '../notify';
import { publishAssigned, publishRequest } from '../realtime/realtime-link';
import { requireUser } from '../utils/auth';
import { sortBy, toPage } from '../utils/paging';
import { conflict, forbidden, notFound, unprocessable } from '../utils/responses';
import { hasErrors, validateRequestData } from '../utils/validation';
import { dueAtFor, firstStep, refNoFor } from '../workflow';
import { canView, isInInbox } from './access';
import { bulkDecision } from './bulk-decision';
import { applyDecision, validateDecision } from './decision';

function matchesQuery(request: ServiceRequest, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    request.refNo.toLowerCase().includes(needle) ||
    JSON.stringify(request.data).toLowerCase().includes(needle)
  );
}

function findOwnEditable(user: User, id: string): ServiceRequest | Response {
  const request = db.requests.find((candidate) => candidate.id === id);
  if (!request) return notFound();
  if (request.applicantId !== user.id) return forbidden();
  if (request.status !== 'draft' && request.status !== 'returned') {
    return conflict('errors.notEditable');
  }
  return request;
}

function touch(request: ServiceRequest): ServiceRequest {
  request.updatedAt = new Date().toISOString();
  return request;
}

export const requestHandlers = [
  http.get('/api/requests', ({ request }) => {
    const user = requireUser(request);
    if (user instanceof Response) return user;
    const params = new URL(request.url).searchParams;
    const status = params.get('status');
    const typeId = params.get('typeId');
    const q = params.get('q')?.trim();
    const inboxOnly = params.get('assignee') === 'me';

    const items = db.requests.filter(
      (candidate) =>
        canView(user, candidate) &&
        (!inboxOnly || isInInbox(user, candidate)) &&
        (!status || candidate.status === status) &&
        (!typeId || candidate.typeId === typeId) &&
        (!q || matchesQuery(candidate, q)),
    );
    const sorted = sortBy(items, params.get('sort'), 'createdAt:desc');
    return HttpResponse.json<Page<ServiceRequest>>(toPage(sorted, params));
  }),

  http.post('/api/requests/bulk-decision', ({ request }) => bulkDecision(request)),

  http.get<{ id: string }>('/api/requests/:id', ({ request, params }) => {
    const user = requireUser(request);
    if (user instanceof Response) return user;
    const found = db.requests.find((candidate) => candidate.id === params.id);
    if (!found) return notFound();
    return canView(user, found) ? HttpResponse.json<ServiceRequest>(found) : forbidden();
  }),

  http.get<{ id: string }>('/api/requests/:id/audit', ({ request, params }) => {
    const user = requireUser(request);
    if (user instanceof Response) return user;
    const found = db.requests.find((candidate) => candidate.id === params.id);
    if (!found) return notFound();
    if (!canView(user, found)) return forbidden();
    const events = db.audit
      .filter((event) => event.requestId === found.id)
      .sort((a, b) => a.at.localeCompare(b.at));
    return HttpResponse.json<AuditEvent[]>(events);
  }),

  http.post<never, { typeId: string }>('/api/requests', async ({ request }) => {
    const user = requireUser(request, ['applicant']);
    if (user instanceof Response) return user;
    const { typeId } = await request.json();
    const type = db.requestTypes.find((candidate) => candidate.id === typeId && candidate.active);
    if (!type) return unprocessable({ typeId: ['validation.option'] });
    const now = new Date().toISOString();
    const created: ServiceRequest = {
      id: db.nextId('req'),
      refNo: refNoFor(type, db.nextSeq(), new Date().getFullYear()),
      typeId,
      applicantId: user.id,
      data: {},
      attachments: [],
      status: 'draft',
      currentStepId: null,
      assigneeId: null,
      createdAt: now,
      updatedAt: now,
    };
    db.requests.push(created);
    recordAudit(created.id, user.id, 'created');
    db.commit();
    return HttpResponse.json<ServiceRequest>(created, { status: 201 });
  }),

  http.put<{ id: string }, { data: Record<string, unknown>; attachments?: Attachment[] }>(
    '/api/requests/:id/draft',
    async ({ request, params }) => {
      const user = requireUser(request, ['applicant']);
      if (user instanceof Response) return user;
      const found = findOwnEditable(user, params.id);
      if (found instanceof Response) return found;
      const body = await request.json();
      found.data = body.data ?? {};
      found.attachments = body.attachments ?? found.attachments;
      touch(found);
      db.commit();
      return HttpResponse.json<ServiceRequest>(found);
    },
  ),

  http.post<{ id: string }>('/api/requests/:id/submit', ({ request, params }) => {
    const user = requireUser(request, ['applicant']);
    if (user instanceof Response) return user;
    const found = findOwnEditable(user, params.id);
    if (found instanceof Response) return found;
    const type = db.requestTypes.find((candidate) => candidate.id === found.typeId);
    const step = type && firstStep(type);
    if (!type || !step) return notFound();
    const errors = validateRequestData(type, found.data);
    if (hasErrors(errors)) return unprocessable(errors);

    const now = new Date();
    found.status = 'submitted';
    found.submittedAt ??= now.toISOString();
    found.currentStepId = step.id;
    found.assigneeId = null;
    found.dueAt = dueAtFor(step, now);
    touch(found);
    recordAudit(found.id, user.id, 'submitted');
    notifyRole(step.role, 'request.submitted', found);
    db.commit();
    publishRequest(found);
    return HttpResponse.json<ServiceRequest>(found);
  }),

  http.post<{ id: string }>('/api/requests/:id/claim', ({ request, params }) => {
    const user = requireUser(request, ['reviewer', 'approver']);
    if (user instanceof Response) return user;
    const found = db.requests.find((candidate) => candidate.id === params.id);
    if (!found) return notFound();
    if (!isInInbox(user, found)) {
      return found.assigneeId && found.assigneeId !== user.id
        ? conflict('errors.alreadyClaimed')
        : forbidden();
    }
    found.status = 'in_review';
    found.assigneeId = user.id;
    touch(found);
    recordAudit(found.id, user.id, 'claimed', { stepId: found.currentStepId ?? undefined });
    db.commit();
    publishAssigned(found);
    publishRequest(found);
    return HttpResponse.json<ServiceRequest>(found);
  }),

  http.post<{ id: string }, DecisionRequest>(
    '/api/requests/:id/decision',
    async ({ request, params }) => {
      const user = requireUser(request, ['reviewer', 'approver']);
      if (user instanceof Response) return user;
      const found = db.requests.find((candidate) => candidate.id === params.id);
      if (!found) return notFound();
      if (found.status !== 'in_review' || found.assigneeId !== user.id) {
        return conflict('errors.notClaimed');
      }
      const body = await request.json();
      const failure = validateDecision(user, found, body);
      if (failure) return failure;
      applyDecision(user, found, body);
      db.commit();
      publishRequest(found);
      return HttpResponse.json<ServiceRequest>(found);
    },
  ),
];
