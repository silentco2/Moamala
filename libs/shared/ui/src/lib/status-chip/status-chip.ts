import { Component } from '@angular/core';

/** `<mo-status-chip status="in_review" />` */
@Component({
  selector: 'mo-status-chip',
  templateUrl: './status-chip.html',
  styleUrl: './status-chip.scss',
})
export class StatusChip {
  // TODO(T2.5): declare a required `status` input of type RequestStatus.
  //   Expose it on the host element as `data-status` (use the `host` metadata) so styles and tests
  //   can target it, and translate the label with the key `status.<status>`.
  //   Docs: https://angular.dev/guide/components/host-elements#binding-to-the-host-element
}
