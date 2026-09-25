import { InjectionToken, Signal } from '@angular/core';
import { Role } from '@moamala/shared/models';

/**
 * The signed-in user's role. Provided by the app (from AuthStore) so that
 * shared/util code such as `*moHasRole` never depends on core/auth.
 */
export const CURRENT_ROLE = new InjectionToken<Signal<Role | null>>('CURRENT_ROLE');
