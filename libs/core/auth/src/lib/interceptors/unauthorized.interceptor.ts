import { HttpInterceptorFn } from '@angular/common/http';

// TODO(T1.4): when a response fails with 401, call AuthStore.logout() (which navigates to
//   /login) and rethrow. Skip `/api/auth/login`, where 401 means "wrong credentials".
//   Docs: https://rxjs.dev/api/operators/catchError
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => next(req);
