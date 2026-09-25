import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SlaBadge, StatusChip, Timeline } from '@moamala/shared/ui';
import { PresenceIndicator } from '../presence-indicator/presence-indicator';

/** Shared by every role. Reviewers and approvers get the decision panel in the `actions` outlet. */
@Component({
  selector: 'mo-request-detail-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    PresenceIndicator,
    SlaBadge,
    StatusChip,
    Timeline,
  ],
  templateUrl: './request-detail-page.html',
  styleUrl: './request-detail-page.scss',
})
export class RequestDetailPage {
  // TODO(T2.6): a required `detail` input (RequestDetail, provided by requestDetailResolver).
  //   Derive with computed():
  //   - `sections`: each type section with its visible fields as { key, label, value } where value
  //     is formatted for display (select -> option label, checkbox -> yes/no, dateRange ->
  //     'start - end', file -> attachment name)
  //   - `currentStep`: the StepDef matching request.currentStepId
  //   - `lastComment`: the comment of the latest returned/approved/rejected audit event
  //   - `timeline`: AuditEvent[] -> TimelineItem[] (actor name from `users`, translated
  //     'audit.<action>' title, an icon and tone per action)
  //   Use LanguageService.lang() for localized labels; Transloco's translateSignal() keeps
  //   translated titles reactive to language changes.
  //   Docs: https://angular.dev/guide/signals#computed-signals
}
