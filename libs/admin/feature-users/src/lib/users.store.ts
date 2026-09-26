import { signalStore, withMethods, withState } from '@ngrx/signals';
import { Role, User } from '@moamala/shared/models';

export interface UsersState {
  users: User[];
  loading: boolean;
  /** Ids of users whose role change is in flight. */
  savingIds: string[];
  error: string | null;
}

const initialState: UsersState = { users: [], loading: false, savingIds: [], error: null };

export interface RoleChange {
  userId: string;
  role: Role;
}

/** Provided by UsersPage itself (`providers: [UsersStore]`), so it lives and dies with the page. */
export const UsersStore = signalStore(
  withState(initialState),
  // TODO(T4.5): implement with rxMethod + UsersApi:
  //   - load(): set loading, fetch users, patch them (tapResponse for success/error)
  //   - updateRole({ userId, role }): optimistic update. Patch the user's role immediately and
  //     add the id to savingIds; on success replace the user with the response; on failure
  //     restore the previous role and set `error` to the API message key. Always remove the id
  //     from savingIds. Use mergeMap so edits to different users run in parallel.
  //   Hint: the optimistic-update recipe from React Query (onMutate / onError rollback), written
  //   as an RxJS pipeline.
  //   Docs: https://ngrx.io/guide/signals/rxjs-integration
  withMethods(() => ({
    load: (): void => undefined,
    updateRole: (_change: RoleChange): void => undefined,
  })),
);
