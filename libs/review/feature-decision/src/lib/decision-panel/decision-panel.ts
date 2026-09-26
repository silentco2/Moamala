import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

export const JUSTIFICATION_MIN_LENGTH = 10;

/**
 * Rendered in the detail page's `actions` outlet for reviewers and approvers. The route inherits
 * the resolved `detail` from its parent (paramsInheritanceStrategy: 'always').
 */
@Component({
  selector: 'mo-decision-panel',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
  ],
  templateUrl: './decision-panel.html',
  styleUrl: './decision-panel.scss',
})
export class DecisionPanel {
  // TODO(T3.5): a typed reactive form for the decision.
  //   - input `detail` (RequestDetail); `step` computed from detail().request.currentStepId;
  //     `claimedByMe` computed from assigneeId === AuthStore.user()?.id
  //   - form = inject(NonNullableFormBuilder).group({ action: [null as DecisionAction | null,
  //     Validators.required], comment: [''] })
  //   - the comment is required with at least JUSTIFICATION_MIN_LENGTH characters for every
  //     action except 'forward': toggle its validators when `action` changes (valueChanges +
  //     setValidators + updateValueAndValidity, cleaned up with takeUntilDestroyed)
  //   - submit(): markAllAsTouched; when valid dispatch '[Inbox] Decide' with
  //     { requestId, action, comment }
  //   - server feedback: an effect() on store.selectSignal(selectDecisionErrors) that copies each
  //     entry onto the matching control with setErrors({ server: messageKey })
  //   - claim() dispatches '[Inbox] Claim' when the request is not claimed by me
  //   Hint: FormBuilder typed forms are to Reactive Forms what react-hook-form's generic
  //   useForm<T>() is: the value type flows through every control.
  //   Docs: https://angular.dev/guide/forms/typed-forms
}
