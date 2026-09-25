import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { RequestType, RequestTypeInput } from '@moamala/shared/models';

@Injectable({ providedIn: 'root' })
export class RequestTypesApi {
  // TODO(T4.1): GET /api/request-types (admins receive inactive types too)
  list(): Observable<RequestType[]> {
    return EMPTY;
  }

  // TODO(T4.1): GET /api/request-types/:id
  get(_id: string): Observable<RequestType> {
    return EMPTY;
  }

  // TODO(T4.1): POST /api/request-types
  create(_input: RequestTypeInput): Observable<RequestType> {
    return EMPTY;
  }

  // TODO(T4.1): PUT /api/request-types/:id
  update(_id: string, _input: RequestTypeInput): Observable<RequestType> {
    return EMPTY;
  }

  // TODO(T4.3): GET /api/request-types/key-availability?key=...&excludeId=... -> `available`
  isKeyAvailable(_key: string, _excludeId?: string): Observable<boolean> {
    return of(true);
  }
}
