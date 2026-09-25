import { ServiceRequest } from '@moamala/shared/models';
import { recordAudit } from '../audit-log';
import { db } from '../db/db';
import { notifyRole, notifyUser } from '../notify';
import { dueAtFor, firstStep, HOUR_MS, refNoFor } from '../workflow';
import { publishRequest } from './realtime-link';

const MIN_INTERVAL_MS = 45_000;
const MAX_INTERVAL_MS = 90_000;
const WARNING_WINDOW_MS = 6 * HOUR_MS;

/**
 * Emits occasional background activity (new submissions, SLA warnings) so the
 * realtime features have something to show. Disable with
 * `localStorage.mockSimulator = 'off'`. Only the visible tab simulates, so two
 * open tabs do not double the traffic.
 */
export function startSimulator(): void {
  const schedule = () =>
    setTimeout(tick, MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));

  const tick = () => {
    const enabled = globalThis.localStorage?.getItem('mockSimulator') !== 'off';
    if (enabled && document.visibilityState === 'visible') {
      if (Math.random() < 0.5) simulateSubmission();
      else simulateSlaAlerts();
    }
    schedule();
  };

  schedule();
}

function simulateSubmission(): void {
  const template = pickRandom(db.requests.filter((request) => request.status !== 'draft'));
  const type = template && db.requestTypes.find((candidate) => candidate.id === template.typeId);
  const step = type && firstStep(type);
  if (!template || !type || !step) return;

  const now = new Date();
  const request: ServiceRequest = {
    ...structuredClone(template),
    id: db.nextId('req'),
    refNo: refNoFor(type, db.nextSeq(), now.getFullYear()),
    status: 'submitted',
    currentStepId: step.id,
    assigneeId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    submittedAt: now.toISOString(),
    dueAt: dueAtFor(step, now),
  };
  db.requests.push(request);
  recordAudit(request.id, request.applicantId, 'created');
  recordAudit(request.id, request.applicantId, 'submitted');
  notifyRole(step.role, 'request.submitted', request);
  db.commit();
  publishRequest(request);
}

function simulateSlaAlerts(): void {
  const now = Date.now();
  const alreadyNotified = (requestId: string, kind: string) =>
    db.notifications.some((n) => n.kind === kind && n.payload.requestId === requestId);

  for (const request of db.requests) {
    if (!request.dueAt || !['submitted', 'in_review'].includes(request.status)) continue;
    const remaining = Date.parse(request.dueAt) - now;
    const kind = remaining < 0 ? 'sla.breached' : remaining < WARNING_WINDOW_MS ? 'sla.warning' : null;
    if (!kind || alreadyNotified(request.id, kind)) continue;
    if (request.assigneeId) {
      notifyUser(request.assigneeId, kind, request);
    } else {
      const step = db.requestTypes
        .find((type) => type.id === request.typeId)
        ?.steps.find((candidate) => candidate.id === request.currentStepId);
      if (step) notifyRole(step.role, kind, request);
    }
  }
  db.commit();
}

function pickRandom<T>(items: T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}
