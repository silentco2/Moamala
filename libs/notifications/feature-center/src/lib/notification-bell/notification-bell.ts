import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

/** Toolbar bell with the unread count; projected into the layout's `[moToolbarActions]` slot. */
@Component({
  selector: 'mo-notification-bell',
  imports: [MatBadgeModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
})
export class NotificationBell {
  // TODO(T5.3): inject NotificationsStore and call load() once on init.
  //   - the badge shows unreadCount() and is hidden at 0
  //   - the menu lists latest(); open(notification) calls markRead(id) and navigates to
  //     /requests/:requestId (router.navigateByUrl)
  //   Docs: https://material.angular.dev/components/badge/overview
}
