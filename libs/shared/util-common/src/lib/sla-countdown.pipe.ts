import { Pipe, PipeTransform } from '@angular/core';

/**
 * `{{ request.dueAt | slaCountdown: now() }}` -> `2d 4h`, `3h 20m`, `45m`, or `-5h 10m` when overdue.
 */
@Pipe({ name: 'slaCountdown' })
export class SlaCountdownPipe implements PipeTransform {
  // TODO(T2.5): format the time between `now` and `dueAt` as a compact duration.
  //   Rules: >= 1 day -> `Xd Yh`; >= 1 hour -> `Xh Ym`; otherwise `Xm`; overdue values get a `-`
  //   prefix; a missing dueAt returns ''. Round down to whole minutes.
  //   Hint: keep it pure. Passing `now` as an argument (from a ticking signal) is what makes the
  //   output change over time; a pure pipe only re-runs when its inputs change. That is the same
  //   idea as a memoized selector or `useMemo` with explicit dependencies.
  //   Docs: https://angular.dev/guide/templates/pipes
  transform(_dueAt: string | null | undefined, _now: number = Date.now()): string {
    return '';
  }
}
