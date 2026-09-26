import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { RequestDetail } from '@moamala/shared/models';

@Injectable({ providedIn: 'root' })
export class RequestDetailApi {
  // TODO(T2.6): load a RequestDetail in parallel where possible:
  //   GET /api/requests/:id, GET /api/requests/:id/audit and GET /api/users together (forkJoin),
  //   then GET /api/request-types/:typeId for the request's type (switchMap), combined into one
  //   object.
  //   Hint: forkJoin is Promise.all for Observables that complete.
  //   Docs: https://rxjs.dev/api/index/function/forkJoin
  load(_id: string): Observable<RequestDetail> {
    return EMPTY;
  }
}
