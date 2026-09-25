import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type TimelineTone = 'neutral' | 'positive' | 'negative' | 'warning';

/** Presentation model: callers map domain events (e.g. AuditEvent) to this shape. */
export interface TimelineItem {
  id: string;
  icon: string;
  title: string;
  actor: string;
  at: string;
  comment?: string;
  tone: TimelineTone;
}

/** `<mo-timeline [items]="items()" />` renders items in the given order. */
@Component({
  selector: 'mo-timeline',
  imports: [MatIconModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  // TODO(T2.6): declare an `items` input (TimelineItem[], default []) and import DatePipe for
  //   the timestamps. A default keeps parents that do not bind it yet compiling.
  //   Docs: https://angular.dev/guide/components/inputs
}
