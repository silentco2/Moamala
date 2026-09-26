import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { PageHeader } from '@moamala/shared/ui';

@Component({
  selector: 'mo-type-list-page',
  imports: [MatButtonModule, MatIconModule, MatListModule, PageHeader],
  templateUrl: './type-list-page.html',
  styleUrl: './type-list-page.scss',
})
export class TypeListPage {
  // TODO(T4.1): load RequestTypesApi.list() (toSignal or rxResource) and render one row per type.
  //   Docs: https://angular.dev/api/core/rxjs-interop/rxResource
}
