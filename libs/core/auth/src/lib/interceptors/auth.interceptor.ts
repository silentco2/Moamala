import { HttpInterceptorFn } from '@angular/common/http';

// TODO(T1.4): add `Authorization: Bearer <token>` to requests for `/api/` URLs when
//   AuthStore.token() is set. Requests are immutable: use req.clone({ setHeaders }).
//   Hint: the same job an axios request interceptor does.
//   Docs: https://angular.dev/guide/http/interceptors
export const authInterceptor: HttpInterceptorFn = (req, next) => next(req);
