import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { AuditEvent, AuditQuery, Page } from '@moamala/shared/models';

export const AUDIT_PAGE_SIZE = 50;

@Injectable({ providedIn: 'root' })
export class AuditApi {
  // TODO(T6.1): GET /api/audit with the query as params (omit empty values)
  search(_query: AuditQuery): Observable<Page<AuditEvent>> {
    return EMPTY;
  }
}
