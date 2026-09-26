import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportsPage } from './reports-page/reports-page';

// TODO(T4.6): finish the legacy feature module:
//   - add RouterModule.forChild([{ path: '', component: ReportsPage }]) to `imports`
//   - add ReportsService to `providers`
//   - lazy load it from app.routes.ts with loadChildren: () => import(...).then(m => m.ReportsModule)
//   Docs: https://angular.dev/guide/ngmodules/lazy-loading
@NgModule({
  declarations: [ReportsPage],
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
})
export class ReportsModule {}
