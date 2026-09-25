import { Component } from '@angular/core';

/** `<mo-page-header heading="..." subtitle="..."><button moPageActions>...</button></mo-page-header>` */
@Component({
  selector: 'mo-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  // TODO(T2.1): declare a required `heading` input and an optional `subtitle` input.
  //   Hint: input.required<string>() is like a required prop in a typed React component;
  //   reading it is a signal call: heading().
  //   Docs: https://angular.dev/guide/components/inputs
}
