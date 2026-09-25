import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import {
  BulkDecisionRequest,
  BulkDecisionResponse,
  DecisionRequest,
  ServiceRequest,
} from '@moamala/shared/models';

export const INBOX_PAGE_SIZE = 100;

@Injectable({ providedIn: 'root' })
export class ReviewApi {
  // TODO(T3.3): GET /api/requests?assignee=me&pageSize=INBOX_PAGE_SIZE and return page.items
  inbox(): Observable<ServiceRequest[]> {
    return EMPTY;
  }

  // TODO(T3.3): POST /api/requests/:id/claim
  claim(_requestId: string): Observable<ServiceRequest> {
    return EMPTY;
  }

  // TODO(T3.3): POST /api/requests/:id/decision with `{ action, comment }`
  decide(_requestId: string, _body: DecisionRequest): Observable<ServiceRequest> {
    return EMPTY;
  }

  // TODO(T3.3): POST /api/requests/bulk-decision
  bulkDecide(_body: BulkDecisionRequest): Observable<BulkDecisionResponse> {
    return EMPTY;
  }
}
