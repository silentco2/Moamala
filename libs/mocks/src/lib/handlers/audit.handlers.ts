import { http, HttpResponse } from 'msw';
import { AuditEvent, Page } from '@moamala/shared/models';
import { db } from '../db/db';
import { requireUser } from '../utils/auth';
import { toPage } from '../utils/paging';

export const auditHandlers = [
  http.get('/api/audit', ({ request }) => {
    const user = requireUser(request, ['admin']);
    if (user instanceof Response) return user;
    const params = new URL(request.url).searchParams;
    const filter = (key: string) => params.get(key) || null;
    const [requestId, actorId, action, typeId, stepId, from, to] = [
      'requestId',
      'actorId',
      'action',
      'typeId',
      'stepId',
      'from',
      'to',
    ].map(filter);
    const typeOf = (event: AuditEvent) =>
      db.requests.find((candidate) => candidate.id === event.requestId)?.typeId;

    const items = db.audit
      .filter(
        (event) =>
          (!requestId || event.requestId === requestId) &&
          (!actorId || event.actorId === actorId) &&
          (!action || event.action === action) &&
          (!typeId || typeOf(event) === typeId) &&
          (!stepId || event.stepId === stepId) &&
          (!from || event.at >= from) &&
          (!to || event.at <= `${to}T23:59:59.999Z`),
      )
      .sort((a, b) => b.at.localeCompare(a.at));
    return HttpResponse.json<Page<AuditEvent>>(toPage(items, params, 50));
  }),
];
