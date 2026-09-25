import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeader } from '@moamala/shared/ui';

@Component({
  selector: 'mo-users-page',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, PageHeader],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage {
  // TODO(T4.5): provide UsersStore at component level (`providers: [UsersStore]`), call
  //   store.load() on init, and call store.updateRole({ userId, role }) when a role select
  //   changes. Show a spinner for ids in savingIds() and a snackbar when error() is set.
  //   Docs: https://ngrx.io/guide/signals/signal-store#providing-and-injecting-the-store
}
