import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Layout } from '@moamala/core/layout';
import { NotificationBell } from '@moamala/notifications/feature-center';

/**
 * Signed-in chrome: the layout with the notification bell projected into its toolbar and the
 * routed page as its content. Use it as the component of the authenticated parent route (T1.2).
 */
@Component({
  selector: 'mo-shell',
  imports: [Layout, NotificationBell, RouterOutlet],
  template: `
    <mo-layout>
      <mo-notification-bell moToolbarActions />
      <router-outlet />
    </mo-layout>
  `,
})
export class Shell {}
