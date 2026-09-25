import { signal } from '@angular/core';
import { signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Role, User } from '@moamala/shared/models';

export interface AuthState {
  user: User | null;
  token: string | null;
}

export const AUTH_STORAGE_KEY = 'moamala.auth';

const initialState: AuthState = { user: null, token: null };

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  // TODO(T1.3): replace these placeholders with computed() values derived from `user`/`token`:
  //   isAuthenticated, role, isApplicant, isReviewer, isApprover, isAdmin, and isStaff
  //   (reviewer, approver or admin).
  //   Hint: like selectors derived from a Redux slice, but they are signals you call: store.role().
  //   Docs: https://ngrx.io/guide/signals/signal-store#defining-computed-signals
  withComputed(() => ({
    isAuthenticated: signal(false).asReadonly(),
    role: signal<Role | null>(null).asReadonly(),
    isApplicant: signal(false).asReadonly(),
    isReviewer: signal(false).asReadonly(),
    isApprover: signal(false).asReadonly(),
    isAdmin: signal(false).asReadonly(),
    isStaff: signal(false).asReadonly(),
  })),
  // TODO(T1.3): implement the methods with inject(HttpClient) and patchState():
  //   login(email): POST /api/auth/login -> LoginResponse, patch state, persist { token, user }
  //   as JSON under AUTH_STORAGE_KEY in sessionStorage, resolve with the user (firstValueFrom is
  //   fine here). sessionStorage is per tab, so two tabs can be signed in as two different users
  //   while sharing the mock backend (see "Two tabs, two roles" in the README).
  //   logout(): clear state and storage, then navigate to /login.
  //   Docs: https://ngrx.io/guide/signals/signal-store#defining-store-methods
  withMethods(() => ({
    login: (_email: string): Promise<User> => Promise.reject(new Error('TODO T1.3')),
    logout: (): void => undefined,
  })),
  // TODO(T1.3): add withHooks({ onInit }) that restores a persisted session from sessionStorage,
  //   ignoring malformed JSON. Put it after withMethods so the hook can use them.
  //   React analogy: the "rehydrate on mount" step of redux-persist.
  //   Docs: https://ngrx.io/guide/signals/signal-store/lifecycle-hooks
);
