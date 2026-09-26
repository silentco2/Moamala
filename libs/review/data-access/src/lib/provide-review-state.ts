import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

// TODO(T3.3): register the feature state and effects for the review routes:
//   makeEnvironmentProviders([provideState(INBOX_FEATURE_KEY, inboxReducer), provideEffects({...})])
//   and add provideReviewState() to the `providers` of the review route in app.routes.ts.
//   Docs: https://ngrx.io/guide/store/feature-creators#standalone-api
export function provideReviewState(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
