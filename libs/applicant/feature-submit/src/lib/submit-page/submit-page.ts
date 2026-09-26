import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FileDropzone, PageHeader } from '@moamala/shared/ui';

export const AUTOSAVE_DEBOUNCE_MS = 1500;

/**
 * Routes: `/applicant/requests/new?typeId=...` and `/applicant/requests/:id/edit`
 * (the "returned for changes" flow reopens the same page prefilled).
 */
@Component({
  selector: 'mo-submit-page',
  imports: [
    FileDropzone,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    PageHeader,
  ],
  templateUrl: './submit-page.html',
  styleUrl: './submit-page.scss',
})
export class SubmitPage {
  // TODO(T2.3): loading and autosave (implement HasUnsavedChanges for unsavedChangesGuard)
  //   - inputs from the route: `id` (path param) and `typeId` (query param)
  //   - an effect() that calls ApplicantStore.openDraft({ requestId: id(), typeId: typeId() })
  //   - a public `formValue` writable signal (the spec drives autosave through it), reset from
  //     store.draft()?.data whenever a different draft loads (linkedSignal fits well)
  //   - autosave: toObservable(formValue) + debounceTime(AUTOSAVE_DEBOUNCE_MS) +
  //     distinctUntilChanged (compare JSON) -> store.saveDraft(value); skip the initial value
  //   - hasUnsavedChanges(): true while formValue differs from the last saved draft data
  //   - the header shows "Saved at hh:mm" from store.savedAt() and "Saving..." while saving
  //   Hint: debounced autosave is the classic useDebounce + useEffect combo; here the signal
  //   becomes an Observable so RxJS operators can shape it.
  //   Docs: https://angular.dev/ecosystem/rxjs-interop#create-an-observable-from-a-signal-with-toobservable
  //
  // TODO(T2.2): submit
  //   - viewChild(DynamicForm) and Signal Forms submit(form, action): the action awaits
  //     store.submit() and navigates to /requests/:id; on a rejected ApiError keep its fieldErrors
  //     in a `serverErrors` signal passed to the form
  //   Docs: https://angular.dev/guide/forms/signals/form-submission
  //
  // TODO(T2.4): attachments
  //   - onFiles(files): validateFile() each file (shared/util-forms); invalid files get an error
  //     row; valid ones start UploadService.upload() and show a progress row
  //   - keep uploads in a signal of { id, name, percent, error } rows; on 'done' call
  //     store.addAttachment() and drop the row; cancelUpload(id) unsubscribes
  //   - removeAttachment(id) delegates to the store
  //   Docs: https://angular.dev/guide/http/making-requests#monitoring-upload-and-download-progress
}
