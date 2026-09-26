import { Pipe, PipeTransform } from '@angular/core';
import { Lang, Localized } from '@moamala/shared/models';

/** `{{ type.name | localize: lang() }}` picks the value for the active language. */
@Pipe({ name: 'localize' })
export class LocalizePipe implements PipeTransform {
  // TODO(T1.5): return the text for `lang`, falling back to English when that entry is empty,
  //   and '' for a missing value.
  //   Hint: take the language as a pipe argument (from LanguageService.lang()) so this stays a
  //   pure pipe and still updates when the user switches language.
  //   Docs: https://angular.dev/guide/templates/pipes#pipes-and-change-detection
  transform(_value: Localized | null | undefined, _lang: Lang): string {
    return '';
  }
}
