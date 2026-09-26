import { Route } from '@angular/router';

// TODO(T1.2): define the route tree. Every page is lazy loaded (loadComponent/loadChildren).
//   login                         LoginPage (core/auth)
//   ''  (Shell, canActivate: [authGuard])
//     ''                          pathMatch 'full', redirectTo: redirectToRoleHome
//     applicant                   canMatch: [roleGuard('applicant')]
//       catalog                   CatalogPage
//       requests                  MyRequestsPage
//       requests/new              SubmitPage (canDeactivate: [unsavedChangesGuard])
//       requests/:id/edit         SubmitPage (canDeactivate: [unsavedChangesGuard])
//     review                      canMatch: [roleGuard('reviewer', 'approver')],
//                                 providers: [provideReviewState()]
//       inbox                     InboxPage
//     requests/:id                RequestDetailPage, resolve: { detail: requestDetailResolver },
//                                 providers: [provideReviewState()] (the decision panel needs it)
//       ''  outlet 'actions'      DecisionPanel, canMatch: [roleGuard('reviewer', 'approver')]
//     admin                       canMatch: [roleGuard('admin')]
//       types, types/new, types/:id   TypeListPage / TypeDesignerPage
//       users                     UsersPage
//       reports                   loadChildren -> ReportsModule (legacy, T4.6)
//       audit                     AuditLogPage
//     notifications               NotificationsPage
//   **                            NotFoundPage
//   Hint: canMatch skips a route (and its lazy chunk) when the guard says no; canActivate runs
//   after matching. React Router's closest match is a loader that throws a redirect.
//   Docs: https://angular.dev/guide/routing/define-routes
export const appRoutes: Route[] = [];
