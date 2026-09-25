import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { Role, User } from '@moamala/shared/models';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  // TODO(T4.5): GET /api/users
  //   Docs: https://angular.dev/guide/http/making-requests
  list(): Observable<User[]> {
    return EMPTY;
  }

  // TODO(T4.5): PATCH /api/users/:id/role with `{ role }`
  //   Docs: https://angular.dev/guide/http/making-requests
  updateRole(_userId: string, _role: Role): Observable<User> {
    return EMPTY;
  }
}
