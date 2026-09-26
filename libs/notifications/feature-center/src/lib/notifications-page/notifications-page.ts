import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { PageHeader } from '@moamala/shared/ui';

@Component({
  selector: 'mo-notifications-page',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, MatListModule, PageHeader],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.scss',
})
export class NotificationsPage {
  // TODO(T5.3): a `filter` signal ('all' | 'unread'); `visible` computed from store.items();
  //   "Mark all as read" calls store.markAllRead(); clicking an item marks it read and opens
  //   /requests/:requestId.
  //   Docs: https://angular.dev/guide/signals#computed-signals
}
