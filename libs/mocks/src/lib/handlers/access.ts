import { RequestStatus, ServiceRequest, User } from '@moamala/shared/models';
import { db } from '../db/db';

const OPEN_STATUSES: RequestStatus[] = ['submitted', 'in_review'];

export function canView(user: User, request: ServiceRequest): boolean {
  return user.role === 'applicant' ? request.applicantId === user.id : request.status !== 'draft';
}

/** Requests waiting at a step this user's role handles, unclaimed or claimed by them. */
export function isInInbox(user: User, request: ServiceRequest): boolean {
  if (!OPEN_STATUSES.includes(request.status)) return false;
  const step = db.requestTypes
    .find((type) => type.id === request.typeId)
    ?.steps.find((candidate) => candidate.id === request.currentStepId);
  return step?.role === user.role && (request.assigneeId === null || request.assigneeId === user.id);
}
