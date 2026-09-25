import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Friendly placeholder for empty lists: `<mo-empty-state icon="inbox" heading="..." message="..." />` */
@Component({
  selector: 'mo-empty-state',
  imports: [MatIconModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  // TODO(T2.1): declare inputs `icon` (default 'inbox'), `heading` (required) and `message`.
  //   Docs: https://angular.dev/guide/components/inputs
}
