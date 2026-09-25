import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

/**
 * Renders a RequestType's field schema as a sectioned Signal Form.
 * `<mo-dynamic-form [type]="type" [(value)]="formValue" [attachments]="draft.attachments" [lang]="lang()" />`
 */
@Component({
  selector: 'mo-dynamic-form',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
  ],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss',
})
export class DynamicForm {
  // TODO(T2.2): the public API
  //   - `type` required input (RequestType), `lang` input (Lang, default 'en'),
  //     `attachments` input (Attachment[], default []) offered as choices for `file` fields,
  //     `serverErrors` input (Record<string, string[]> | null) to show 422 messages per field
  //   - `value` model() (RequestFormModel) for two-way binding: [(value)]="formValue"
  //   - a public `form` built with form(this.value, requestTypeSchema(fields)) from
  //     shared/util-forms, recreated when `type` changes (computed + the `injector` option), so a
  //     parent can call submit(dynamicForm.form(), ...) through viewChild
  //   - make sure every field key exists in `value` (text '' / number null / checkbox false /
  //     dateRange { start: '', end: '' } / select and file null): Signal Forms only creates
  //     fields for keys present in the model
  //   - `sections` computed: each section with its fields; hide fields with isFieldVisible
  //   Hint: this is the classic "JSON schema -> form" renderer; in React you might map over the
  //   schema and switch on field.type. The same shape works here with @for and @switch.
  //   Docs: https://angular.dev/guide/forms/signals/overview
}
