import { schema, Schema } from '@angular/forms/signals';
import { FieldDef } from '@moamala/shared/models';

/** Model edited by the dynamic request form: field key -> value. */
export type RequestFormModel = Record<string, unknown>;

// TODO(T2.2): return whether `field` should be shown for the current form value.
//   A field without `visibleIf` is always visible; otherwise compare
//   `value[visibleIf.field]` with `visibleIf.equals`.
//   Docs: https://angular.dev/guide/forms/signals/field-state-management
export function isFieldVisible(_field: FieldDef, _value: RequestFormModel): boolean {
  return true;
}

// TODO(T2.2): build a Signal Forms schema from the field definitions.
//   For each field: required / pattern / min / max from its FieldDef, hidden() driven by
//   isFieldVisible, and validators that only apply while the field is visible (a hidden field must
//   never block submission). For `dateRange` fields add a custom validate() rule that reports
//   `{ kind: 'dateRange' }` when `end` is before `start`.
//   Expected error kinds: 'required', 'pattern', 'min', 'max', 'dateRange'.
//   Hint: the model is `Record<string, unknown>`, so `path[field.key]` is untyped; narrow it with a
//   small typed helper instead of sprinkling casts. Rules are reactive: `applyWhen` and the
//   `valueOf` helper in the logic context let one field's rules read another field's value.
//   In React terms this is a Zod/Yup schema built at runtime from JSON.
//   Note: Signal Forms only creates child fields for keys present in the model, so the form that
//   uses this schema must initialise every field key (see T2.2 in TASKS.md).
//   Docs: https://angular.dev/guide/forms/signals/validation
export function requestTypeSchema(_fields: readonly FieldDef[]): Schema<RequestFormModel> {
  return schema<RequestFormModel>(() => undefined);
}
