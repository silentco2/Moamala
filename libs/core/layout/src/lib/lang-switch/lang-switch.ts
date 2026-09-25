import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Toggles between English and Arabic. The label names the language you switch *to*. */
@Component({
  selector: 'mo-lang-switch',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './lang-switch.html',
  styleUrl: './lang-switch.scss',
})
export class LangSwitch {
  // TODO(T1.5): inject LanguageService; `target` = computed(() => the other language);
  //   clicking calls language.use(target()). Show 'العربية' while in English and 'English' while
  //   in Arabic, and set the button's `lang` attribute to the target language.
  //   Docs: https://angular.dev/guide/signals#computed-signals
}
