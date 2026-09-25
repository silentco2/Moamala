import { HttpContextToken } from '@angular/common/http';

/**
 * Set on a request to handle its errors locally instead of showing the global snackbar:
 * `http.get(url, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })`.
 */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const RETRY_COUNT = 2;

export const RETRY_BASE_DELAY_MS = 500;
