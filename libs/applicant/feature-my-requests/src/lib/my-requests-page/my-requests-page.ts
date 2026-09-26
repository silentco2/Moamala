import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { PageHeader, StatusChip } from '@moamala/shared/ui';

export const MY_REQUESTS_PAGE_SIZE = 10;

@Component({
  selector: 'mo-my-requests-page',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    PageHeader,
    StatusChip,
  ],
  templateUrl: './my-requests-page.html',
  styleUrl: './my-requests-page.scss',
})
export class MyRequestsPage {
  // TODO(T2.5): the URL is the source of truth for filters.
  //   - inputs bound from query params by the router (withComponentInputBinding):
  //     `status`, `q`, `sort` (strings) and `page` (number; use the numberAttribute transform)
  //   - `query` computed -> RequestQuery { page (default 1), pageSize: MY_REQUESTS_PAGE_SIZE,
  //     status, q, sort } without undefined keys
  //   - an effect() that calls ApplicantStore.loadMyRequests(query())
  //   - filter/search/paginator handlers navigate with router.navigate([], { queryParams,
  //     queryParamsHandling: 'merge' }); a new status or search resets page to 1; 'all' clears
  //     the status (null)
  //   - a `now` signal (ticking every minute) for the slaCountdown pipe
  //   Hint: think of useSearchParams() as state: you never set local filter state, you change
  //   the URL and derive everything from it.
  //   Docs: https://angular.dev/guide/routing/common-router-tasks#getting-route-information
}
