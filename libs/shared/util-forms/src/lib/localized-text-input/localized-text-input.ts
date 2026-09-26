import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/**
 * Edits a `Localized` value (`{ en, ar }`) as one form control:
 * `<mo-localized-text-input formControlName="name" label="Name" />`
 */
@Component({
  selector: 'mo-localized-text-input',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './localized-text-input.html',
  styleUrl: './localized-text-input.scss',
})
export class LocalizedTextInput {
  // TODO(T4.2): implement ControlValueAccessor so this component works with formControlName.
  //   Register it with the NG_VALUE_ACCESSOR multi provider (forwardRef to this class), keep the
  //   current value in a signal, and implement writeValue / registerOnChange /
  //   registerOnTouched / setDisabledState. Emit a new `{ en, ar }` object on every keystroke and
  //   mark touched on blur. Add an optional `label` input for the group caption.
  //   Hint: React has no direct equivalent; the closest is a controlled component whose
  //   value/onChange props are supplied by the form library instead of the parent.
  //   Docs: https://angular.dev/api/forms/ControlValueAccessor
}
