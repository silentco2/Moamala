import { HttpInterceptorFn } from '@angular/common/http';

// TODO(T1.4): show a MatSnackBar message for network errors (status 0), 403 and 5xx, then
//   rethrow. The API returns an ApiError body whose `message` is a translation key; translate it
//   with TranslocoService (fallback key 'errors.server'). Never toast 401/404/422 (handled
//   elsewhere), and respect the SKIP_ERROR_TOAST context token.
//   Docs: https://angular.dev/guide/http/interceptors#request-and-response-metadata
export const errorInterceptor: HttpInterceptorFn = (req, next) => next(req);
