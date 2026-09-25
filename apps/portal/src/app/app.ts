import { Component } from '@angular/core';
import { LoginPage } from '@moamala/core/auth';

@Component({
  selector: 'mo-root',
  imports: [LoginPage],
  templateUrl: './app.html',
})
export class App {}
