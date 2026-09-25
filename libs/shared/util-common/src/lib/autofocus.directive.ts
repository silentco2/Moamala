import { Directive } from '@angular/core';

/** Usage: `<input moAutofocus>` focuses the element once it is rendered. */
@Directive({ selector: '[moAutofocus]' })
export class Autofocus {
  // TODO(T6.3): focus the host element after it renders.
  //   Inject ElementRef<HTMLElement> and call focus() inside afterNextRender() so it runs only in
  //   the browser, after the DOM exists. React analogy: `useEffect(() => ref.current?.focus(), [])`.
  //   Docs: https://angular.dev/api/core/afterNextRender
}
