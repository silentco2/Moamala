import { http, HttpResponse } from 'msw';
import { AppNotification } from '@moamala/shared/models';
import { db } from '../db/db';
import { requireUser } from '../utils/auth';
import { noContent, notFound } from '../utils/responses';

export const notificationHandlers = [
  http.get('/api/notifications', ({ request }) => {
    const user = requireUser(request);
    if (user instanceof Response) return user;
    const own = db.notifications
      .filter((notification) => notification.userId === user.id)
      .sort((a, b) => b.at.localeCompare(a.at));
    return HttpResponse.json<AppNotification[]>(own);
  }),

  http.post('/api/notifications/read-all', ({ request }) => {
    const user = requireUser(request);
    if (user instanceof Response) return user;
    db.notifications
      .filter((notification) => notification.userId === user.id)
      .forEach((notification) => (notification.read = true));
    db.commit();
    return noContent();
  }),

  http.patch<{ id: string }, { read: boolean }>(
    '/api/notifications/:id',
    async ({ request, params }) => {
      const user = requireUser(request);
      if (user instanceof Response) return user;
      const notification = db.notifications.find(
        (candidate) => candidate.id === params.id && candidate.userId === user.id,
      );
      if (!notification) return notFound();
      notification.read = (await request.json()).read;
      db.commit();
      return HttpResponse.json<AppNotification>(notification);
    },
  ),
];
