import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

/** Texts are passed already translated by the caller. */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

/** Open with `dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, { data })`. */
@Component({
  selector: 'mo-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  // TODO(T2.3): inject MAT_DIALOG_DATA (typed as ConfirmDialogData) and render it.
  //   The confirm button closes the dialog with `true`, cancel with `false`.
  //   Hint: the caller awaits `afterClosed()`, like awaiting a promise returned by a modal hook.
  //   Docs: https://material.angular.dev/components/dialog/overview#sharing-data-with-the-dialog-component
}
