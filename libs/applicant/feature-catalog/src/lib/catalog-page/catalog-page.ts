import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EmptyState, PageHeader } from '@moamala/shared/ui';

@Component({
  selector: 'mo-catalog-page',
  imports: [
    EmptyState,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    PageHeader,
  ],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  // TODO(T2.1): fetch the catalog with httpResource<RequestType[]>(() => '/api/request-types?active=true').
  //   - `search` signal bound to the search box; `visibleTypes` computed filters by name in the
  //     active language (case-insensitive)
  //   - expose `lang` from LanguageService for the localize pipe
  //   - retry() calls resource.reload()
  //   Hint: resource.isLoading(), error() and value() replace the loading/error/data triple you
  //   would get from React Query; the template decides which state to render.
  //   Docs: https://angular.dev/guide/http/http-resource
}
