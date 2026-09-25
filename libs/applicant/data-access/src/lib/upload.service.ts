import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { Attachment } from '@moamala/shared/models';

export type UploadProgress =
  { state: 'progress'; percent: number } | { state: 'done'; attachment: Attachment };

@Injectable({ providedIn: 'root' })
export class UploadService {
  // TODO(T2.4): POST the file as FormData (field name `file`) to /api/uploads with
  //   `reportProgress: true, observe: 'events'`. Map HttpEventType.UploadProgress to
  //   `{ state: 'progress', percent }` (rounded, 0-100) and the HttpResponse to
  //   `{ state: 'done', attachment }`; ignore other events. Unsubscribing cancels the upload.
  //   Hint: this replaces axios' onUploadProgress callback with a stream of events.
  //   Docs: https://angular.dev/guide/http/making-requests#monitoring-upload-and-download-progress
  upload(_file: File): Observable<UploadProgress> {
    return EMPTY;
  }
}
