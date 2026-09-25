export type RequestStatus = 'draft' | 'submitted' | 'in_review' | 'returned' | 'approved' | 'rejected';

export const REQUEST_STATUSES: readonly RequestStatus[] = [
  'draft',
  'submitted',
  'in_review',
  'returned',
  'approved',
  'rejected',
];

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mime: string;
  url: string;
}

export interface ServiceRequest {
  id: string;
  refNo: string;
  typeId: string;
  applicantId: string;
  data: Record<string, unknown>;
  attachments: Attachment[];
  status: RequestStatus;
  currentStepId: string | null;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  dueAt?: string;
}
