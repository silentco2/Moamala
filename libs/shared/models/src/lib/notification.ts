export type NotificationKind =
  | 'request.submitted'
  | 'request.assigned'
  | 'request.returned'
  | 'request.approved'
  | 'request.rejected'
  | 'sla.warning'
  | 'sla.breached';

/** Kinds that should also surface as a toast, not only in the notification center. */
export const HIGH_PRIORITY_KINDS: readonly NotificationKind[] = ['sla.breached', 'request.returned'];

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  payload: { requestId?: string; refNo?: string; [key: string]: unknown };
  read: boolean;
  at: string;
}
