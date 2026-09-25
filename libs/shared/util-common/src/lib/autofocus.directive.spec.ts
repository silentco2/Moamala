import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Autofocus } from './autofocus.directive';

@Component({
  imports: [Autofocus],
  template: `<input data-testid="plain" /><input moAutofocus data-testid="focused" />`,
})
class Host {}

describe('Autofocus', () => {
  it('T6.3 focuses the host element after render', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const target = fixture.nativeElement.querySelector('[data-testid="focused"]');
    expect(document.activeElement).toBe(target);
    fixture.nativeElement.remove();
  });
});
