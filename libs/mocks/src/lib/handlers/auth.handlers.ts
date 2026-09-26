import { http, HttpResponse } from 'msw';
import { LoginRequest, LoginResponse, User } from '@moamala/shared/models';
import { db } from '../db/db';
import { issueToken, requireUser } from '../utils/auth';
import { apiError, unprocessable } from '../utils/responses';

export const authHandlers = [
  /** Public: the users shown on the demo login screen. */
  http.get('/api/auth/demo-users', () => HttpResponse.json<User[]>(db.users)),

  http.post<never, LoginRequest>('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (!body?.email?.trim()) return unprocessable({ email: ['validation.required'] });
    const user = db.users.find((candidate) => candidate.email === body.email.trim().toLowerCase());
    if (!user) return apiError(401, 'errors.invalidCredentials');
    return HttpResponse.json<LoginResponse>({ token: issueToken(user), user });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const user = requireUser(request);
    return user instanceof Response ? user : HttpResponse.json<User>(user);
  }),
];
