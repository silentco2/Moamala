import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** `<mo-file-dropzone accept="application/pdf" [multiple]="true" (filesSelected)="upload($event)" />` */
@Component({
  selector: 'mo-file-dropzone',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './file-dropzone.html',
  styleUrl: './file-dropzone.scss',
})
export class FileDropzone {
  // TODO(T2.4): inputs `accept` (string), `multiple` (boolean) and `disabled` (boolean);
  //   an output `filesSelected` that emits File[] from both the hidden <input type="file"> and
  //   drag-and-drop. Track a `dragging` signal (dragenter/dragover -> true, dragleave/drop ->
  //   false) and reflect it as the `file-dropzone--active` class. Call preventDefault() on
  //   dragover/drop, emit nothing while disabled, and reset the input value after a pick so the
  //   same file can be chosen twice.
  //   Hint: output() is the equivalent of an `onFilesSelected` callback prop.
  //   Docs: https://angular.dev/guide/components/outputs
}
