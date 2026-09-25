import { Injectable, Signal, signal } from '@angular/core';
import { Direction } from '@angular/cdk/bidi';
import { Lang } from '@moamala/shared/models';

export const LANG_STORAGE_KEY = 'moamala.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  // TODO(T1.5): keep the active language in a private writable signal and expose it read-only as
  //   `lang`; derive `dir` ('rtl' for Arabic) with computed().
  readonly lang: Signal<Lang> = signal<Lang>('en');
  readonly dir: Signal<Direction> = signal<Direction>('ltr');

  // TODO(T1.5): switch language at runtime:
  //   - update the signal and call TranslocoService.setActiveLang(lang)
  //   - set `dir` and `lang` on document.documentElement (inject DOCUMENT)
  //   - persist the choice in localStorage under LANG_STORAGE_KEY
  //   Hint: templates that bind `[dir]="language.dir()"` (the CDK Dir directive) let Material
  //   components such as the sidenav and menus flip automatically.
  //   Docs: https://jsverse.github.io/transloco/docs/translation-api#setactivelang
  use(_lang: Lang): void {
    return;
  }

  // TODO(T1.5): apply the persisted language (fallback 'en'). Call it once at startup, e.g. from
  //   provideAppInitializer() in app.config.ts.
  //   Docs: https://angular.dev/api/core/provideAppInitializer
  restore(): void {
    return;
  }
}
