import { ResolveFn } from '@angular/router';
import { RequestDetail } from '@moamala/shared/models';

// TODO(T2.6): resolve RequestDetailApi.load(route.paramMap.get('id')) so the page renders with
//   data already loaded. With withComponentInputBinding() the result arrives as the page's
//   `detail` input: `{ path: 'requests/:id', resolve: { detail: requestDetailResolver }, ... }`.
//   Docs: https://angular.dev/guide/routing/data-resolvers
export const requestDetailResolver: ResolveFn<RequestDetail> = () => {
  throw new Error('TODO T2.6');
};
