import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'mo-login-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  // TODO(T1.3): load the demo accounts from GET /api/auth/demo-users with httpResource<User[]>.
  //   Picking an account (or submitting the email field) calls AuthStore.login(email), then
  //   navigates with router.navigateByUrl(ROLE_HOME[user.role]). Keep a `signingIn` signal to
  //   disable the buttons while the request runs and an `error` signal for failed logins.
  //   Hint: httpResource is the signal-based cousin of React Query's useQuery.
  //   Docs: https://angular.dev/guide/http/http-resource
}
