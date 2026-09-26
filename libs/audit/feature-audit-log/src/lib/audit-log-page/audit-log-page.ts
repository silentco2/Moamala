import { Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { PageHeader } from '@moamala/shared/ui';

@Component({
  selector: 'mo-audit-log-page',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    PageHeader,
    ScrollingModule,
  ],
  templateUrl: './audit-log-page.html',
  styleUrl: './audit-log-page.scss',
})
export class AuditLogPage {
  // TODO(T6.1): server-side filtered, infinitely scrolling audit log.
  //   - public writable filter signals: `typeId`, `action`, `actorId`, `from`, `to`
  //     (string | null) and `stepId` = linkedSignal(...) that resets to null whenever typeId
  //     changes (a step only makes sense within its request type)
  //   - `stepOptions` computed from the selected type's steps; type and user options come from
  //     GET /api/request-types and GET /api/users (httpResource)
  //   - whenever a filter changes, reload page 1 via AuditApi.search({ ...filters, page, pageSize:
  //     AUDIT_PAGE_SIZE }); keep `events` and `total` signals
  //   - loadMore(): fetch the next page and append; trigger it from the viewport's
  //     (scrolledIndexChange) when the user nears the end
  //   Hint: linkedSignal is "state derived from props that the user can still edit", the case
  //   React solves with a key reset or an effect that syncs state.
  //   Docs: https://angular.dev/guide/signals/linked-signal
}
