import { http, HttpResponse } from 'msw';
import { KeyAvailability, RequestType, RequestTypeInput } from '@moamala/shared/models';
import { recordAudit } from '../audit-log';
import { db } from '../db/db';
import { requireUser } from '../utils/auth';
import { noContent, notFound, unprocessable } from '../utils/responses';
import { hasErrors, validateRequestType } from '../utils/validation';

export const requestTypeHandlers = [
  http.get('/api/request-types', ({ request }) => {
    const user = requireUser(request);
    if (user instanceof Response) return user;
    const activeOnly =
      user.role === 'applicant' || new URL(request.url).searchParams.get('active') === 'true';
    const types = db.requestTypes.filter((type) => !activeOnly || type.active);
    return HttpResponse.json<RequestType[]>(types);
  }),

  http.get('/api/request-types/key-availability', ({ request }) => {
    const user = requireUser(request, ['admin']);
    if (user instanceof Response) return user;
    const params = new URL(request.url).searchParams;
    const key = params.get('key') ?? '';
    const excludeId = params.get('excludeId');
    const available = !db.requestTypes.some((type) => type.key === key && type.id !== excludeId);
    return HttpResponse.json<KeyAvailability>({ key, available });
  }),

  http.get<{ id: string }>('/api/request-types/:id', ({ request, params }) => {
    const user = requireUser(request);
    if (user instanceof Response) return user;
    const type = db.requestTypes.find((candidate) => candidate.id === params.id);
    return type ? HttpResponse.json<RequestType>(type) : notFound();
  }),

  http.post<never, RequestTypeInput>('/api/request-types', async ({ request }) => {
    const user = requireUser(request, ['admin']);
    if (user instanceof Response) return user;
    const input = await request.json();
    const errors = validateRequestType(input, db.requestTypes);
    if (hasErrors(errors)) return unprocessable(errors);
    const type: RequestType = { ...input, id: db.nextId('rt'), version: 1 };
    db.requestTypes.push(type);
    recordAudit('', user.id, 'type_created', { comment: type.key });
    db.commit();
    return HttpResponse.json<RequestType>(type, { status: 201 });
  }),

  http.put<{ id: string }, RequestTypeInput>(
    '/api/request-types/:id',
    async ({ request, params }) => {
      const user = requireUser(request, ['admin']);
      if (user instanceof Response) return user;
      const index = db.requestTypes.findIndex((type) => type.id === params.id);
      if (index < 0) return notFound();
      const input = await request.json();
      const errors = validateRequestType(input, db.requestTypes, params.id);
      if (hasErrors(errors)) return unprocessable(errors);
      const current = db.requestTypes[index];
      const updated: RequestType = { ...input, id: current.id, version: current.version + 1 };
      db.requestTypes[index] = updated;
      recordAudit('', user.id, 'type_updated', { comment: updated.key });
      db.commit();
      return HttpResponse.json<RequestType>(updated);
    },
  ),

  /** Soft delete: deactivates the type so existing requests keep their schema. */
  http.delete<{ id: string }>('/api/request-types/:id', ({ request, params }) => {
    const user = requireUser(request, ['admin']);
    if (user instanceof Response) return user;
    const type = db.requestTypes.find((candidate) => candidate.id === params.id);
    if (!type) return notFound();
    type.active = false;
    db.commit();
    return noContent();
  }),
];
