import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldOption } from '@moamala/shared/models';
import { OptionsListEditor } from './options-list-editor';

@Component({
  imports: [ReactiveFormsModule, OptionsListEditor],
  template: `<mo-options-list-editor [formControl]="control" />`,
})
class Host {
  readonly control = new FormControl<FieldOption[]>(
    [
      { value: 'a', label: { en: 'Alpha', ar: 'ألف' } },
      { value: 'b', label: { en: 'Beta', ar: 'باء' } },
    ],
    { nonNullable: true },
  );
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  await fixture.whenStable();
  const all = (id: string) =>
    Array.from(fixture.nativeElement.querySelectorAll(`[data-testid="${id}"]`)) as HTMLElement[];
  return { fixture, control: fixture.componentInstance.control, all };
}

describe('OptionsListEditor', () => {
  it('T4.2 renders one row per option', async () => {
    const { all } = await render();
    expect(all('option-row').length).toBe(2);
    expect((all('option-label-en')[1] as HTMLInputElement).value).toBe('Beta');
  });

  it('T4.2 adds an empty option', async () => {
    const { all, control } = await render();
    all('add-option')[0].click();
    expect(control.value.length).toBe(3);
    expect(control.value[2]).toEqual({ value: '', label: { en: '', ar: '' } });
  });

  it('T4.2 removes an option without mutating the original array', async () => {
    const { all, control } = await render();
    const original = control.value;
    all('remove-option')[0].click();
    expect(control.value.map((option) => option.value)).toEqual(['b']);
    expect(original.length).toBe(2);
  });

  it('T4.2 updates a row when its inputs change', async () => {
    const { all, control } = await render();
    const valueInput = all('option-value')[1] as HTMLInputElement;
    valueInput.value = 'beta';
    valueInput.dispatchEvent(new Event('input'));
    expect(control.value[1].value).toBe('beta');
  });
});
