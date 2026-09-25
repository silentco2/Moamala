import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

// TODO(T5.1): keep the socket in sync with the session. Return
//   provideEnvironmentInitializer(() => { ... }) that runs an effect(): connect with
//   AuthStore.token() when it is set, disconnect when it becomes null. Add it to app.config.ts.
//   Docs: https://angular.dev/api/core/provideEnvironmentInitializer
export function provideRealtimeConnection(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
