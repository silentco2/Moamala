import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Localized } from '@moamala/shared/models';
import { LocalizedTextInput } from './localized-text-input';

@Component({
  imports: [ReactiveFormsModule, LocalizedTextInput],
  template: `<mo-localized-text-input [formControl]="control" />`,
})
class Host {
  readonly control = new FormControl<Localized>(
    { en: 'Permit', ar: 'تصريح' },
    { nonNullable: true },
  );
}

function render() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const input = (lang: 'en' | 'ar') =>
    fixture.nativeElement.querySelector(`[data-testid="localized-${lang}"]`) as HTMLInputElement;
  return { fixture, control: fixture.componentInstance.control, input };
}

describe('LocalizedTextInput', () => {
  it('T4.2 writes the control value into both inputs', async () => {
    const { fixture, input } = render();
    await fixture.whenStable();
    expect(input('en').value).toBe('Permit');
    expect(input('ar').value).toBe('تصريح');
  });

  it('T4.2 propagates typing as a new Localized value', () => {
    const { input, control } = render();
    input('ar').value = 'رخصة';
    input('ar').dispatchEvent(new Event('input'));
    expect(control.value).toEqual({ en: 'Permit', ar: 'رخصة' });
  });

  it('T4.2 marks the control touched on blur', () => {
    const { input, control } = render();
    input('en').dispatchEvent(new Event('blur'));
    expect(control.touched).toBe(true);
  });

  it('T4.2 disables both inputs with the control', async () => {
    const { fixture, input, control } = render();
    control.disable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input('en').disabled).toBe(true);
    expect(input('ar').disabled).toBe(true);
  });
});
