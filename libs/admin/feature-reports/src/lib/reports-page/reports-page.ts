import { ChangeDetectionStrategy, Component } from '@angular/core';

export const REPORTS_REFRESH_MS = 60_000;

/**
 * Legacy style on purpose: NgModule-declared, constructor DI, *ngIf/*ngFor and the async pipe.
 * Compare it with the standalone pages when you write your migration notes in TASKS.md.
 */
@Component({
  selector: 'mo-reports-page',
  standalone: false,
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPage {
  // TODO(T4.6): classic lifecycle-driven component.
  //   - constructor(private readonly reports: ReportsService, private readonly cdr: ChangeDetectorRef)
  //   - `summary$: Observable<ReportSummary>` rendered with `*ngIf="summary$ | async as summary"`
  //   - implement OnInit/OnDestroy: in ngOnInit start `interval(REPORTS_REFRESH_MS)` with a
  //     manual subscribe() that reloads the summary; keep the Subscription and unsubscribe() in
  //     ngOnDestroy. With OnPush, call cdr.markForCheck() when you change a field outside the
  //     async pipe (for example a `lastRefreshed` timestamp).
  //   Hint: this is componentDidMount/componentWillUnmount-era code; the modern equivalent is
  //   toSignal/takeUntilDestroyed.
  //   Docs: https://angular.dev/guide/components/lifecycle
}
