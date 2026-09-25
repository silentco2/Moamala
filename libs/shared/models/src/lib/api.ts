import { Role, User } from './user';
import { DecisionAction } from './request-type';
import { AuditAction } from './audit';
import { RequestStatus, ServiceRequest } from './service-request';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Error body returned by the API for every non-2xx response. */
export interface ApiError {
  status: number;
  message: string;
  /** Present on 422 responses: field key -> list of message keys. */
  fieldErrors?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type SortDirection = 'asc' | 'desc';

export interface RequestQuery {
  page?: number;
  pageSize?: number;
  /** `field:direction`, e.g. `createdAt:desc`. */
  sort?: string;
  status?: RequestStatus;
  typeId?: string;
  q?: string;
  assignee?: 'me';
}

export interface DecisionRequest {
  action: DecisionAction;
  comment: string;
}

export interface BulkDecisionRequest {
  requestIds: string[];
  action: Extract<DecisionAction, 'approve' | 'reject'>;
  comment: string;
}

export interface BulkDecisionResponse {
  updated: ServiceRequest[];
  failed: { requestId: string; message: string }[];
}

export interface AuditQuery {
  page?: number;
  pageSize?: number;
  requestId?: string;
  actorId?: string;
  action?: AuditAction;
  typeId?: string;
  stepId?: string;
  from?: string;
  to?: string;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

export interface KeyAvailability {
  key: string;
  available: boolean;
}

export interface ReportSummary {
  totals: Record<RequestStatus, number>;
  byType: { typeId: string; count: number; avgHoursToDecision: number }[];
  slaBreaches: number;
  generatedAt: string;
}

/** Upload limits enforced by the API (and mirrored by client-side validators). */
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const UPLOAD_ALLOWED_MIME: readonly string[] = ['application/pdf', 'image/png', 'image/jpeg'];
