import { http, HttpResponse } from 'msw';
import { ROLES, UpdateUserRoleRequest, User } from '@moamala/shared/models';
import { recordAudit } from '../audit-log';
import { db } from '../db/db';
import { requireUser } from '../utils/auth';
import { notFound, unprocessable } from '../utils/responses';

export const userHandlers = [
  /** Any signed-in user can read the directory (names are shown on timelines). */
  http.get('/api/users', ({ request }) => {
    const user = requireUser(request);
    return user instanceof Response ? user : HttpResponse.json<User[]>(db.users);
  }),

  http.patch<{ id: string }, UpdateUserRoleRequest>(
    '/api/users/:id/role',
    async ({ request, params }) => {
      const admin = requireUser(request, ['admin']);
      if (admin instanceof Response) return admin;
      const target = db.users.find((candidate) => candidate.id === params.id);
      if (!target) return notFound();
      const { role } = await request.json();
      if (!ROLES.includes(role)) return unprocessable({ role: ['validation.option'] });
      if (target.id === admin.id) return unprocessable({ role: ['validation.ownRole'] });
      target.role = role;
      recordAudit('', admin.id, 'role_changed', { comment: `${target.email} -> ${role}` });
      db.commit();
      return HttpResponse.json<User>(target);
    },
  ),
];
