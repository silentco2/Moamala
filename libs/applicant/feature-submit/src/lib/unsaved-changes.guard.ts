import { CanDeactivateFn } from '@angular/router';

/** Implemented by pages that can hold unsaved edits. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

// TODO(T2.3): allow leaving when the component has no unsaved changes; otherwise open the
//   ConfirmDialog (shared/ui) with translated texts (keys confirmLeave.*) and resolve with its
//   result. Return the Observable from afterClosed() mapped to a boolean (undefined -> false).
//   Hint: React Router's useBlocker, but declared on the route: `canDeactivate: [unsavedChangesGuard]`.
//   Docs: https://angular.dev/api/router/CanDeactivateFn
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = () => true;
