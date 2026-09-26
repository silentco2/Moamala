import { HttpResponse } from 'msw';
import { ApiError } from '@moamala/shared/models';

export type FieldErrors = Record<string, string[]>;

export function apiError(status: number, message: string, fieldErrors?: FieldErrors) {
  return HttpResponse.json<ApiError>({ status, message, fieldErrors }, { status });
}

export const unauthorized = () => apiError(401, 'errors.unauthorized');

export const forbidden = () => apiError(403, 'errors.forbidden');

export const notFound = () => apiError(404, 'errors.notFound');

export const conflict = (message: string) => apiError(409, message);

export const unprocessable = (fieldErrors: FieldErrors) =>
  apiError(422, 'errors.validation', fieldErrors);

export const noContent = () => new HttpResponse(null, { status: 204 });
