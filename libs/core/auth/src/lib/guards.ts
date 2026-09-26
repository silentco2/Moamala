import { CanActivateFn, CanMatchFn } from '@angular/router';
import { Role } from '@moamala/shared/models';

// TODO(T1.2): allow navigation when AuthStore.isAuthenticated(); otherwise return a UrlTree to
//   /login (inject(Router).parseUrl / createUrlTree).
//   Hint: in React Router this is a <RequireAuth> wrapper that renders <Navigate to="/login">.
//   Docs: https://angular.dev/guide/routing/route-guards
export const authGuard: CanActivateFn = () => false;

// TODO(T1.2): factory for a canMatch guard: `canMatch: [roleGuard('admin')]`.
//   Match when the signed-in role is one of `roles`; otherwise return a UrlTree to that user's
//   ROLE_HOME (or /login when anonymous). canMatch keeps the lazy chunk from even loading.
//   Docs: https://angular.dev/api/router/CanMatchFn
export function roleGuard(..._roles: Role[]): CanMatchFn {
  return () => false;
}
