import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type SlaState = 'none' | 'ok' | 'warning' | 'overdue';

/** How often the countdown re-evaluates. */
export const SLA_TICK_MS = 30_000;

/** `<mo-sla-badge [dueAt]="request.dueAt" [warningHours]="12" />` */
@Component({
  selector: 'mo-sla-badge',
  imports: [MatIconModule],
  templateUrl: './sla-badge.html',
  styleUrl: './sla-badge.scss',
})
export class SlaBadge {
  // TODO(T3.6): inputs `dueAt` (ISO string | undefined) and `warningHours` (default 12).
  //   Drive a `now` signal from RxJS `timer(0, SLA_TICK_MS)` and stop it with takeUntilDestroyed()
  //   (or use toSignal, which cleans up for you) so no timer survives the component.
  //   Derive `state` with computed(): 'none' without dueAt, 'overdue' when past due, 'warning'
  //   within `warningHours`, otherwise 'ok'. Expose it on the host as `data-state`.
  //   Show the remaining time with your slaCountdown pipe (T2.5), passing now().
  //   Hint: React would use setInterval inside useEffect with a cleanup function; here the
  //   DestroyRef does the cleanup.
  //   Docs: https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed
}
