import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { PageHeader, SlaBadge, StatusChip } from '@moamala/shared/ui';

export const BULK_COMMENT_MIN_LENGTH = 10;

@Component({
  selector: 'mo-inbox-page',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    PageHeader,
    SlaBadge,
    StatusChip,
  ],
  templateUrl: './inbox-page.html',
  styleUrl: './inbox-page.scss',
})
export class InboxPage {
  // TODO(T3.4): inject the Store, dispatch '[Inbox] Load Inbox' on init, and read
  //   store.selectSignal(selectInboxViewModel).
  //   Hint: selectSignal is useSelector that returns a signal.
  //   Docs: https://ngrx.io/guide/store/selectors
  //
  // TODO(T3.4): the table
  //   - a MatTableDataSource fed from vm().requests (an effect keeps `data` in sync), wired to
  //     MatSort and MatPaginator via viewChild; sortable by refNo, submittedAt and dueAt
  //   - a SelectionModel<ServiceRequest>(true) for the checkbox column with "select all"
  //   - claim(request) dispatches '[Inbox] Claim' for unclaimed rows
  //   - approvers get a bulk bar: a comment (>= BULK_COMMENT_MIN_LENGTH characters) plus
  //     Approve / Reject buttons that dispatch '[Inbox] Bulk Decide' for the selected ids and
  //     then clear the selection and comment
  //   Docs: https://material.angular.dev/components/table/overview#selection
}
