import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { RequestType, RequestTypeInput } from '@moamala/shared/models';

@Injectable({ providedIn: 'root' })
export class RequestTypesApi {
  // TODO(T4.1): GET /api/request-types (admins receive inactive types too)
  //   Docs: https://angular.dev/guide/http/making-requests
  list(): Observable<RequestType[]> {
    return EMPTY;
  }

  // TODO(T4.1): GET /api/request-types/:id
  //   Docs: https://angular.dev/guide/http/making-requests
  get(_id: string): Observable<RequestType> {
    return EMPTY;
  }

  // TODO(T4.1): POST /api/request-types
  //   Docs: https://angular.dev/guide/http/making-requests
  create(_input: RequestTypeInput): Observable<RequestType> {
    return EMPTY;
  }

  // TODO(T4.1): PUT /api/request-types/:id
  //   Docs: https://angular.dev/guide/http/making-requests
  update(_id: string, _input: RequestTypeInput): Observable<RequestType> {
    return EMPTY;
  }

  // TODO(T4.3): GET /api/request-types/key-availability?key=...&excludeId=... -> `available`
  //   Docs: https://angular.dev/guide/http/making-requests
  isKeyAvailable(_key: string, _excludeId?: string): Observable<boolean> {
    return of(true);
  }
}
