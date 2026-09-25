import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

/** Edits the `options` of a select field (`FieldOption[]`) as one form control. */
@Component({
  selector: 'mo-options-list-editor',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './options-list-editor.html',
  styleUrl: './options-list-editor.scss',
})
export class OptionsListEditor {
  // TODO(T4.2): implement ControlValueAccessor for a `FieldOption[]` value.
  //   Keep the list in a signal; add() appends `{ value: '', label: { en: '', ar: '' } }`,
  //   remove(index) deletes a row, editing any input replaces that row. Every change emits a new
  //   array (never mutate the one you received in writeValue).
  //   Docs: https://angular.dev/api/forms/ControlValueAccessor
}
