import { DecisionRequest, ServiceRequest, User } from '@moamala/shared/models';
import { recordAudit } from '../audit-log';
import { db } from '../db/db';
import { notifyRole, notifyUser } from '../notify';
import { forbidden, notFound, unprocessable } from '../utils/responses';
import { dueAtFor, findStep, nextStep } from '../workflow';

const MIN_COMMENT_LENGTH = 10;

/** Returns an error response when the decision is not allowed, otherwise `null`. */
export function validateDecision(
  user: User,
  request: ServiceRequest,
  body: DecisionRequest,
): Response | null {
  const type = db.requestTypes.find((candidate) => candidate.id === request.typeId);
  const step = type && findStep(type, request.currentStepId);
  if (!type || !step) return notFound();
  if (step.role !== user.role) return forbidden();

  const fieldErrors: Record<string, string[]> = {};
  if (!step.actions.includes(body.action)) fieldErrors['action'] = ['validation.actionNotAllowed'];
  if (body.action === 'forward' && !nextStep(type, step.id)) {
    fieldErrors['action'] = ['validation.actionNotAllowed'];
  }
  const comment = body.comment?.trim() ?? '';
  if (body.action !== 'forward') {
    if (!comment) fieldErrors['comment'] = ['validation.required'];
    else if (comment.length < MIN_COMMENT_LENGTH) fieldErrors['comment'] = ['validation.minLength'];
  }
  return Object.keys(fieldErrors).length ? unprocessable(fieldErrors) : null;
}

/** Moves the request through the workflow. Assumes `validateDecision` passed. */
export function applyDecision(user: User, request: ServiceRequest, body: DecisionRequest): void {
  const type = db.requestTypes.find((candidate) => candidate.id === request.typeId);
  if (!type) return;
  const stepId = request.currentStepId ?? undefined;
  const comment = body.comment?.trim() || undefined;
  const next = nextStep(type, request.currentStepId);
  const now = new Date();

  request.assigneeId = null;
  request.updatedAt = now.toISOString();

  if ((body.action === 'forward' || body.action === 'approve') && next) {
    request.status = 'submitted';
    request.currentStepId = next.id;
    request.dueAt = dueAtFor(next, now);
    recordAudit(request.id, user.id, 'forwarded', { stepId, comment });
    notifyRole(next.role, 'request.submitted', request);
    return;
  }

  request.currentStepId = null;
  request.dueAt = undefined;
  if (body.action === 'return') {
    request.status = 'returned';
    recordAudit(request.id, user.id, 'returned', { stepId, comment });
    notifyUser(request.applicantId, 'request.returned', request);
  } else if (body.action === 'approve') {
    request.status = 'approved';
    recordAudit(request.id, user.id, 'approved', { stepId, comment });
    notifyUser(request.applicantId, 'request.approved', request);
  } else {
    request.status = 'rejected';
    recordAudit(request.id, user.id, 'rejected', { stepId, comment });
    notifyUser(request.applicantId, 'request.rejected', request);
  }
}
