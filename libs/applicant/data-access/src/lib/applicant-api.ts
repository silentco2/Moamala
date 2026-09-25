import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import {
  Attachment,
  Page,
  RequestQuery,
  RequestType,
  ServiceRequest,
} from '@moamala/shared/models';

/** HTTP calls used by the applicant area. All paths are documented in libs/mocks/API.md. */
@Injectable({ providedIn: 'root' })
export class ApplicantApi {
  // TODO(T2.5): GET /api/requests with the query as HttpParams (skip undefined values).
  //   Docs: https://angular.dev/guide/http/making-requests#setting-url-parameters
  listMine(_query: RequestQuery): Observable<Page<ServiceRequest>> {
    return EMPTY;
  }

  // TODO(T2.3): GET /api/requests/:id
  //   Docs: https://angular.dev/guide/http/making-requests
  get(_id: string): Observable<ServiceRequest> {
    return EMPTY;
  }

  // TODO(T2.3): GET /api/request-types/:id
  //   Docs: https://angular.dev/guide/http/making-requests
  getType(_id: string): Observable<RequestType> {
    return EMPTY;
  }

  // TODO(T2.3): POST /api/requests with `{ typeId }` -> the new draft
  //   Docs: https://angular.dev/guide/http/making-requests
  create(_typeId: string): Observable<ServiceRequest> {
    return EMPTY;
  }

  // TODO(T2.3): PUT /api/requests/:id/draft with `{ data, attachments }`
  //   Docs: https://angular.dev/guide/http/making-requests
  saveDraft(
    _id: string,
    _data: Record<string, unknown>,
    _attachments: Attachment[],
  ): Observable<ServiceRequest> {
    return EMPTY;
  }

  // TODO(T2.3): POST /api/requests/:id/submit (the API answers 422 with fieldErrors when invalid)
  //   Docs: https://angular.dev/guide/http/making-requests
  submit(_id: string): Observable<ServiceRequest> {
    return EMPTY;
  }
}
