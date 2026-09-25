import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mo-not-found-page',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {}
