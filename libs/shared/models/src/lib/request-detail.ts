import { AuditEvent } from './audit';
import { RequestType } from './request-type';
import { ServiceRequest } from './service-request';
import { User } from './user';

/** Everything the request detail screen needs, resolved before the route activates. */
export interface RequestDetail {
  request: ServiceRequest;
  type: RequestType;
  events: AuditEvent[];
  users: User[];
}
