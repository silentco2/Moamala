import { AuditAction, AuditEvent } from '@moamala/shared/models';
import { db } from './db/db';

export function recordAudit(
  requestId: string,
  actorId: string,
  action: AuditAction,
  extra: Pick<AuditEvent, 'stepId' | 'comment'> = {},
): AuditEvent {
  const event: AuditEvent = {
    id: db.nextId('ae'),
    requestId,
    actorId,
    action,
    at: new Date().toISOString(),
    ...extra,
  };
  db.audit.push(event);
  return event;
}
