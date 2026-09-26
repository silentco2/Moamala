import { RedirectFunction } from '@angular/router';
import { Role } from '@moamala/shared/models';

/** Landing page for each role after sign-in. */
export const ROLE_HOME: Record<Role, string> = {
  applicant: '/applicant/catalog',
  reviewer: '/review/inbox',
  approver: '/review/inbox',
  admin: '/admin/types',
};

// TODO(T1.2): redirect `''` to ROLE_HOME[role] for the signed-in user, or '/login' when anonymous.
//   Use it as `{ path: '', pathMatch: 'full', redirectTo: redirectToRoleHome }`. Redirect
//   functions run in an injection context, so inject(AuthStore) works here.
//   Docs: https://angular.dev/guide/routing/redirecting-routes#conditional-redirects
export const redirectToRoleHome: RedirectFunction = () => '/login';
