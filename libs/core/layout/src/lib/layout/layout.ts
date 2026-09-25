import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LangSwitch } from '../lang-switch/lang-switch';

/**
 * App shell. Content projection slots:
 * - `[moToolbarActions]`: extra toolbar buttons (e.g. the notification bell)
 * - default: the routed page
 */
@Component({
  selector: 'mo-layout',
  imports: [
    LangSwitch,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  // TODO(T1.6): role-aware navigation and responsive shell.
  //   - navItems = computed(() => NAV_ITEMS filtered by AuthStore.role())
  //   - isHandset = toSignal(BreakpointObserver.observe(Breakpoints.Handset).pipe(map(r => r.matches)))
  //     drives the sidenav: 'over' + closed on handset, 'side' + opened otherwise; close it after
  //     navigating on handset.
  //   - signOut() calls AuthStore.logout(); the user menu shows the localized user name.
  //   Hint: toSignal is the bridge from an Observable to a signal, similar to a custom
  //   useMediaQuery hook built on useSyncExternalStore.
  //   Docs: https://material.angular.dev/cdk/layout/overview
  //
  // TODO(T6.3): on every NavigationEnd move focus to <main> and announce the page title with
  //   LiveAnnouncer, so keyboard and screen-reader users know the route changed.
  //   Docs: https://material.angular.dev/cdk/a11y/overview#liveannouncer
}
