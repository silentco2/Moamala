import { HttpResponse } from 'msw';
import { BulkDecisionRequest, BulkDecisionResponse } from '@moamala/shared/models';
import { db } from '../db/db';
import { publishRequest } from '../realtime/realtime-link';
import { requireUser } from '../utils/auth';
import { unprocessable } from '../utils/responses';
import { applyDecision, validateDecision } from './decision';
import { isInInbox } from './access';

/** Approvers can decide many inbox items at once; unclaimed items are auto-claimed. */
export async function bulkDecision(request: Request): Promise<Response> {
  const user = requireUser(request, ['approver']);
  if (user instanceof Response) return user;
  const body = (await request.json()) as BulkDecisionRequest;
  if (!body.requestIds?.length) return unprocessable({ requestIds: ['validation.minItems'] });

  const result: BulkDecisionResponse = { updated: [], failed: [] };
  for (const requestId of body.requestIds) {
    const found = db.requests.find((candidate) => candidate.id === requestId);
    if (!found || !isInInbox(user, found)) {
      result.failed.push({ requestId, message: 'errors.notInInbox' });
      continue;
    }
    const failure = validateDecision(user, found, body);
    if (failure) {
      result.failed.push({ requestId, message: 'errors.validation' });
      continue;
    }
    found.assigneeId = user.id;
    found.status = 'in_review';
    applyDecision(user, found, body);
    result.updated.push(found);
  }
  db.commit();
  result.updated.forEach(publishRequest);
  return HttpResponse.json<BulkDecisionResponse>(result);
}
