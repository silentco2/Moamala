import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';

// TODO(T4.3): sync validator -> `{ typeKey: true }` when a non-empty value does not match
//   TYPE_KEY_PATTERN (from shared/models); null otherwise (leave emptiness to Validators.required).
//   Docs: https://angular.dev/guide/forms/form-validation#defining-custom-validators
export const typeKeyValidator: ValidatorFn = () => null;

// TODO(T4.3): same as typeKeyValidator but for FIELD_KEY_PATTERN -> `{ fieldKey: true }`.
//   Docs: https://angular.dev/guide/forms/form-validation#defining-custom-validators
export const fieldKeyValidator: ValidatorFn = () => null;

// TODO(T4.3): group validator for a FormGroup with numeric `min` and `max` controls ->
//   `{ minMax: true }` on the group when both are set and min > max.
//   Hint: attach it with `fb.group({...}, { validators: minMaxValidator })`.
//   Docs: https://angular.dev/guide/forms/form-validation#cross-field-validation
export const minMaxValidator: ValidatorFn = () => null;

// TODO(T4.3): async validator factory -> `{ keyTaken: true }` when `isAvailable(key)` emits false.
//   Wait `debounceMs` before calling the API (timer + switchMap) and skip empty values. Angular
//   unsubscribes the previous validation when the value changes, which cancels the pending timer.
//   Hint: this is the debounced "check username" pattern you may have built with useEffect.
//   Docs: https://angular.dev/guide/forms/form-validation#creating-asynchronous-validators
export function uniqueKeyValidator(
  _isAvailable: (key: string) => Observable<boolean>,
  _debounceMs = 400,
): AsyncValidatorFn {
  return () => of(null);
}
