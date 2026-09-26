import { HttpInterceptorFn } from '@angular/common/http';

// TODO(T1.4): retry idempotent requests (GET, HEAD) up to RETRY_COUNT times when the error is a
//   network error (status 0) or 5xx, waiting RETRY_BASE_DELAY_MS * 2^(attempt - 1) between tries.
//   Never retry other methods or 4xx responses.
//   Hint: rxjs `retry({ count, delay: (error, retryCount) => ... })` returns timer(...) to retry
//   or throwError(() => error) to give up.
//   Docs: https://rxjs.dev/api/operators/retry
export const retryInterceptor: HttpInterceptorFn = (req, next) => next(req);
