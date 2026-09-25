import { Component } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DynamicForm } from '@moamala/shared/ui-dynamic-form';
import { PageHeader } from '@moamala/shared/ui';
import { LocalizedTextInput, OptionsListEditor } from '@moamala/shared/util-forms';

/** `/admin/types/new` and `/admin/types/:id`. */
@Component({
  selector: 'mo-type-designer-page',
  imports: [
    DragDropModule,
    DynamicForm,
    LocalizedTextInput,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    OptionsListEditor,
    PageHeader,
  ],
  templateUrl: './type-designer-page.html',
  styleUrl: './type-designer-page.scss',
})
export class TypeDesignerPage {
  // TODO(T4.1): a typed, nested Reactive Form built with NonNullableFormBuilder:
  //   { key, name: Localized, description: Localized, active,
  //     sections: FormArray<{ id, title }>, fields: FormArray<field group>, steps: FormArray<step group> }
  //   - small factory methods (sectionGroup / fieldGroup / stepGroup) create each row; a new type
  //     starts with one section, one field and one step
  //   - add/remove methods for each array; drop(event: CdkDragDrop) reorders `fields` (and
  //     `steps`) with moveItemInArray on the controls, then updateValueAndValidity
  //   - optional route input `id`: load RequestTypesApi.get(id) and rebuild the arrays to match
  //     (FormArray.clear() + push), then patchValue
  //   - save(): create or update with form.getRawValue() mapped to RequestTypeInput, then navigate
  //     back to /admin/types
  //   Hint: FormArray is an array of child controls; you move controls, not values.
  //   Docs: https://angular.dev/guide/forms/reactive-forms#creating-dynamic-forms
  //
  // TODO(T4.3): validators: typeKeyValidator + uniqueKeyValidator(key => api.isKeyAvailable(key,
  //   id())) on `key`, fieldKeyValidator on each field key, minMaxValidator on each field group.
  //
  // TODO(T4.4): live preview: `preview` = toSignal(form.valueChanges) mapped to a RequestType
  //   (id 'preview', version 0) and fed to <mo-dynamic-form>, with its own preview value signal.
  //   Docs: https://angular.dev/ecosystem/rxjs-interop#create-a-signal-from-an-observable-with-tosignal
}
