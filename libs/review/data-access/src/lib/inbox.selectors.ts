import { ServiceRequest } from '@moamala/shared/models';

export interface InboxViewModel {
  requests: ServiceRequest[];
  loading: boolean;
  error: string | null;
  total: number;
  unclaimedCount: number;
}

// TODO(T3.2): replace every placeholder with memoized selectors built from
//   createFeatureSelector<InboxState>(INBOX_FEATURE_KEY), the adapter's getSelectors() and
//   createSelector. Keep the exported names; components and specs use them.
//   - selectInboxRequests: all requests sorted by dueAt ascending (no dueAt last)
//   - selectInboxEntities: the entity dictionary (used by bulkDecide$ in T3.3)
//   - selectInboxLoading / selectInboxError / selectDecisionErrors
//   - selectRequestById(id) and selectOverdueRequests(now): selector factories
//   - selectInboxViewModel: one object for the page; it must keep the same reference while the
//     inputs do not change (that is what memoization buys you)
//   Hint: createSelector is reselect's createSelector.
//   Docs: https://ngrx.io/guide/store/selectors
export const selectInboxRequests = (_state: object): ServiceRequest[] => [];

export const selectInboxEntities = (_state: object): Record<string, ServiceRequest | undefined> => ({});

export const selectInboxLoading = (_state: object): boolean => false;

export const selectInboxError = (_state: object): string | null => null;

export const selectDecisionErrors = (_state: object): Record<string, string[]> | null => null;

export const selectRequestById =
  (_id: string) =>
  (_state: object): ServiceRequest | undefined =>
    undefined;

export const selectOverdueRequests =
  (_now: number) =>
  (_state: object): ServiceRequest[] => [];

export const selectInboxViewModel = (_state: object): InboxViewModel => ({
  requests: [],
  loading: false,
  error: null,
  total: 0,
  unclaimedCount: 0,
});
