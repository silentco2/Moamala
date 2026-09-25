import {
  AppNotification,
  Attachment,
  AuditAction,
  AuditEvent,
  RequestStatus,
  RequestType,
  ServiceRequest,
  User,
} from '@moamala/shared/models';
import { dueAtFor, HOUR_MS, refNoFor } from '../workflow';

export interface SeedRequestsResult {
  requests: ServiceRequest[];
  audit: AuditEvent[];
  notifications: AppNotification[];
}

const STATUS_PLAN: RequestStatus[] = [
  ...repeat<RequestStatus>('draft', 5),
  ...repeat<RequestStatus>('submitted', 10),
  ...repeat<RequestStatus>('in_review', 10),
  ...repeat<RequestStatus>('returned', 4),
  ...repeat<RequestStatus>('approved', 7),
  ...repeat<RequestStatus>('rejected', 4),
];

const RETURN_COMMENTS = [
  'The site plan is missing the plot boundaries. Please upload an updated version.',
  'National ID does not match the ownership deed. Please correct it.',
  'Please attach the road closure coordination letter.',
  'The license number format is invalid.',
];

const REJECT_COMMENTS = [
  'The requested building use is not permitted in this district.',
  'The event dates overlap with a national holiday closure.',
  'The license has outstanding violations that must be settled first.',
  'Expected attendance exceeds the venue capacity.',
];

export function createSeedRequests(
  types: RequestType[],
  users: User[],
  now: Date,
): SeedRequestsResult {
  const random = mulberry32(20260925);
  const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];
  const applicants = users.filter((user) => user.role === 'applicant');
  const staffFor = (role: User['role']) => users.filter((user) => user.role === role);

  const requests: ServiceRequest[] = [];
  const audit: AuditEvent[] = [];
  const notifications: AppNotification[] = [];
  let auditSeq = 1;
  let notificationSeq = 1;

  const log = (
    request: ServiceRequest,
    actorId: string,
    action: AuditAction,
    at: Date,
    extra: Partial<AuditEvent> = {},
  ) => {
    audit.push({
      id: `ae-${auditSeq++}`,
      requestId: request.id,
      actorId,
      action,
      at: at.toISOString(),
      ...extra,
    });
  };

  const notify = (
    userId: string,
    kind: AppNotification['kind'],
    request: ServiceRequest,
    at: Date,
    read: boolean,
  ) => {
    notifications.push({
      id: `n-${notificationSeq++}`,
      userId,
      kind,
      payload: { requestId: request.id, refNo: request.refNo },
      read,
      at: at.toISOString(),
    });
  };

  STATUS_PLAN.forEach((status, index) => {
    const type = types[index % types.length];
    const applicant = applicants[index % applicants.length];
    const createdAt = new Date(now.getTime() - (2 + random() * 18) * 24 * HOUR_MS);
    const submittedAt = new Date(createdAt.getTime() + HOUR_MS);
    const attachments = attachmentsFor(type, index);

    const request: ServiceRequest = {
      id: `req-${String(index + 1).padStart(3, '0')}`,
      refNo: refNoFor(type, index + 1, now.getFullYear()),
      typeId: type.id,
      applicantId: applicant.id,
      data: dataFor(type, index, attachments),
      attachments,
      status,
      currentStepId: null,
      assigneeId: null,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
    log(request, applicant.id, 'created', createdAt);

    if (status === 'draft') {
      requests.push(request);
      return;
    }

    request.submittedAt = submittedAt.toISOString();
    log(request, applicant.id, 'submitted', submittedAt);

    const finalStepIndex = type.steps.length - 1;
    const stepIndex =
      status === 'approved' || status === 'rejected'
        ? finalStepIndex
        : status === 'returned'
          ? 0
          : Math.floor(random() * type.steps.length);

    let cursor = submittedAt;
    for (let i = 0; i < stepIndex; i++) {
      const step = type.steps[i];
      const actor = pick(staffFor(step.role));
      cursor = new Date(cursor.getTime() + (2 + random() * 10) * HOUR_MS);
      log(request, actor.id, 'claimed', cursor, { stepId: step.id });
      cursor = new Date(cursor.getTime() + (1 + random() * 6) * HOUR_MS);
      log(request, actor.id, 'forwarded', cursor, { stepId: step.id });
    }

    const step = type.steps[stepIndex];
    const enteredAt = slaAdjustedEntry(status, index, step.slaHours, cursor, now);
    request.currentStepId = step.id;
    request.dueAt = dueAtFor(step, enteredAt);
    request.updatedAt = enteredAt.toISOString();

    if (status === 'submitted') {
      staffFor(step.role).forEach((user) =>
        notify(user.id, 'request.submitted', request, enteredAt, index % 3 === 0),
      );
      requests.push(request);
      return;
    }

    const actor = staffFor(step.role)[index % 2];
    const claimedAt = new Date(enteredAt.getTime() + HOUR_MS);
    log(request, actor.id, 'claimed', claimedAt, { stepId: step.id });
    request.updatedAt = claimedAt.toISOString();

    if (status === 'in_review') {
      request.assigneeId = actor.id;
      if (new Date(request.dueAt).getTime() - now.getTime() < 6 * HOUR_MS) {
        notify(actor.id, 'sla.warning', request, now, false);
      }
      requests.push(request);
      return;
    }

    const decidedAt = new Date(claimedAt.getTime() + 2 * HOUR_MS);
    request.updatedAt = decidedAt.toISOString();
    request.dueAt = undefined;

    if (status === 'returned') {
      request.currentStepId = null;
      log(request, actor.id, 'returned', decidedAt, {
        stepId: step.id,
        comment: RETURN_COMMENTS[index % RETURN_COMMENTS.length],
      });
      notify(applicant.id, 'request.returned', request, decidedAt, false);
    } else if (status === 'approved') {
      request.currentStepId = null;
      log(request, actor.id, 'approved', decidedAt, {
        stepId: step.id,
        comment: 'All requirements satisfied.',
      });
      notify(applicant.id, 'request.approved', request, decidedAt, index % 2 === 0);
    } else {
      request.currentStepId = null;
      log(request, actor.id, 'rejected', decidedAt, {
        stepId: step.id,
        comment: REJECT_COMMENTS[index % REJECT_COMMENTS.length],
      });
      notify(applicant.id, 'request.rejected', request, decidedAt, false);
    }
    requests.push(request);
  });

  return { requests, audit, notifications };
}

/**
 * Chooses when a request entered its current step so the seed always contains
 * overdue, near-due and comfortable SLAs relative to `now`.
 */
function slaAdjustedEntry(
  status: RequestStatus,
  index: number,
  slaHours: number,
  cursor: Date,
  now: Date,
): Date {
  if (status !== 'submitted' && status !== 'in_review') {
    return new Date(cursor.getTime() + 2 * HOUR_MS);
  }
  const bucket = index % 4;
  const hoursLeft =
    bucket === 0 ? -5 : bucket === 1 ? 3 : bucket === 2 ? slaHours / 2 : slaHours - 1;
  return new Date(now.getTime() - (slaHours - hoursLeft) * HOUR_MS);
}

function attachmentsFor(type: RequestType, index: number): Attachment[] {
  return type.fields
    .filter((field) => field.type === 'file')
    .map((field) => ({
      id: `att-${index + 1}-${field.key}`,
      name: `${field.key}-${index + 1}.pdf`,
      size: 120_000 + index * 3_517,
      mime: 'application/pdf',
      url: `/api/uploads/att-${index + 1}-${field.key}`,
    }));
}

function dataFor(
  type: RequestType,
  index: number,
  attachments: Attachment[],
): Record<string, unknown> {
  const attachmentFor = (key: string) =>
    attachments.find((a) => a.id.endsWith(`-${key}`))?.id ?? null;
  switch (type.key) {
    case 'building_permit':
      return {
        ownerName: index % 2 ? 'Layla Nasser' : 'Omar Haddad',
        nationalId: String(1_000_000_000 + index * 7_919),
        phone: `05${String(10_000_000 + index * 131).slice(0, 8)}`,
        plotNumber: `P-${400 + index}`,
        district: ['north', 'central', 'south'][index % 3],
        buildingUse: ['residential', 'commercial', 'mixed'][index % 3],
        floors: 1 + (index % 6),
        description: 'Two-storey family villa with a basement parking level.',
        sitePlan: attachmentFor('sitePlan'),
        ownershipDeed: attachmentFor('ownershipDeed'),
        declaration: true,
      };
    case 'commercial_license_renewal': {
      const hasChanges = index % 2 === 0;
      return {
        licenseNumber: `CL-${String(210_000 + index * 37).padStart(6, '0')}`,
        tradeName: ['Al Noor Trading', 'Desert Rose Café', 'Nakheel Consulting'][index % 3],
        activity: ['retail', 'food', 'services'][index % 3],
        employees: 3 + index,
        hasChanges,
        ...(hasChanges
          ? {
              changeType: 'address',
              newAddress: `Building ${12 + index}, King Fahd Road`,
              changeDetails: 'Relocated to a larger unit on the same street.',
            }
          : {}),
      };
    }
    default: {
      const start = new Date(Date.UTC(2026, 10, 1 + index));
      const end = new Date(start.getTime() + 2 * 24 * HOUR_MS);
      const closure = index % 3 === 0;
      return {
        eventName: ['Heritage Night Market', 'City Fun Run', 'Neighborhood Clean-up'][index % 3],
        category: ['cultural', 'sports', 'community'][index % 3],
        eventDates: { start: isoDate(start), end: isoDate(end) },
        expectedAttendance: 250 + index * 40,
        venue: ['Corniche Park', 'Old Town Square', 'Central Stadium'][index % 3],
        requiresRoadClosure: closure,
        ...(closure ? { roadClosureDetails: 'Close Al Bahr Street from 16:00 to 23:00.' } : {}),
        securityPlan: attachmentFor('securityPlan'),
      };
    }
  }
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function repeat<T>(value: T, times: number): T[] {
  return Array.from({ length: times }, () => value);
}

/** Small deterministic PRNG so the seed is identical on every reset. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}
