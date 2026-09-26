import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';

/** Loads `/i18n/<lang>.json` from the app's public folder. */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  // TODO(T1.1): inject HttpClient and GET `/i18n/${lang}.json`.
  //   Register this class as the `loader` in provideTransloco() inside app.config.ts.
  //   Docs: https://jsverse.github.io/transloco/docs/getting-started/installation#transpiling-the-translation-files
  getTranslation(_lang: string): Observable<Translation> {
    return of({});
  }
}
