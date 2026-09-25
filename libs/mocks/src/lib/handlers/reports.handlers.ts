import { http, HttpResponse } from 'msw';
import { REQUEST_STATUSES, ReportSummary, RequestStatus } from '@moamala/shared/models';
import { db } from '../db/db';
import { requireUser } from '../utils/auth';
import { HOUR_MS } from '../workflow';

export const reportHandlers = [
  http.get('/api/reports/summary', ({ request }) => {
    const user = requireUser(request, ['admin']);
    if (user instanceof Response) return user;
    const now = new Date().toISOString();
    const totals = Object.fromEntries(REQUEST_STATUSES.map((status) => [status, 0])) as Record<
      RequestStatus,
      number
    >;
    db.requests.forEach((request) => (totals[request.status] += 1));

    const byType = db.requestTypes.map((type) => {
      const requests = db.requests.filter((request) => request.typeId === type.id);
      const decided = requests.filter(
        (request) => request.submittedAt && ['approved', 'rejected'].includes(request.status),
      );
      const totalHours = decided.reduce(
        (sum, request) =>
          sum + (Date.parse(request.updatedAt) - Date.parse(request.submittedAt ?? request.updatedAt)) / HOUR_MS,
        0,
      );
      return {
        typeId: type.id,
        count: requests.length,
        avgHoursToDecision: decided.length ? Math.round(totalHours / decided.length) : 0,
      };
    });

    const slaBreaches = db.requests.filter((request) => request.dueAt && request.dueAt < now).length;
    return HttpResponse.json<ReportSummary>({ totals, byType, slaBreaches, generatedAt: now });
  }),
];
