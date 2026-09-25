import { Directive, input } from '@angular/core';
import { Role } from '@moamala/shared/models';

/**
 * Usage: `<button *moHasRole="'admin'">` or `*moHasRole="['reviewer', 'approver']"`.
 */
@Directive({ selector: '[moHasRole]' })
export class HasRole {
  readonly moHasRole = input<Role | readonly Role[]>([]);

  // TODO(T1.6): render the host template only while CURRENT_ROLE() is one of the allowed roles.
  //   Inject TemplateRef and ViewContainerRef, then use an effect() that calls
  //   createEmbeddedView / clear whenever the role or the input changes (no duplicate views).
  //   Hint: this is what a React `<RequireRole role="admin">{children}</RequireRole>` wrapper does,
  //   but as a directive that controls whether its host is rendered at all.
  //   Docs: https://angular.dev/guide/directives/structural-directives
}
