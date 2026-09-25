import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ReportSummary } from '@moamala/shared/models';

/** Provided by ReportsModule (not root) on purpose: this lib shows the NgModule era. */
@Injectable()
export class ReportsService {
  // TODO(T4.6): use constructor injection (`constructor(private readonly http: HttpClient) {}`)
  //   and GET /api/reports/summary. Add the service to ReportsModule `providers`.
  //   Docs: https://angular.dev/guide/di/dependency-injection
  getSummary(): Observable<ReportSummary> {
    return EMPTY;
  }
}
