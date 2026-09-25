export type AuditAction =
  | 'created'
  | 'draft_saved'
  | 'submitted'
  | 'claimed'
  | 'forwarded'
  | 'returned'
  | 'approved'
  | 'rejected'
  | 'commented'
  | 'type_created'
  | 'type_updated'
  | 'role_changed';

export const AUDIT_ACTIONS: readonly AuditAction[] = [
  'created',
  'draft_saved',
  'submitted',
  'claimed',
  'forwarded',
  'returned',
  'approved',
  'rejected',
  'commented',
  'type_created',
  'type_updated',
  'role_changed',
];

export interface AuditEvent {
  id: string;
  /** Empty for events that are not tied to a request (e.g. `role_changed`). */
  requestId: string;
  actorId: string;
  action: AuditAction;
  stepId?: string;
  comment?: string;
  at: string;
}
