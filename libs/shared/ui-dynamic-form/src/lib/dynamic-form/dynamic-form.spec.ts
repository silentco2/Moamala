import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { RequestType } from '@moamala/shared/models';
import { RequestFormModel } from '@moamala/shared/util-forms';
import { DynamicForm } from './dynamic-form';

const label = (en: string) => ({ en, ar: `${en} (ar)` });

const TYPE: RequestType = {
  id: 'rt-test',
  key: 'test_type',
  name: label('Test type'),
  description: label('Test description'),
  sections: [
    { id: 'first', title: label('Alpha section') },
    { id: 'second', title: label('Beta section') },
    { id: 'third', title: label('Gamma section') },
  ],
  fields: [
    { key: 'fullName', type: 'text', section: 'first', label: label('Full name'), required: true },
    {
      key: 'category',
      type: 'select',
      section: 'first',
      label: label('Category'),
      options: [{ value: 'one', label: label('Option one') }],
    },
    { key: 'hasChanges', type: 'checkbox', section: 'second', label: label('Has changes') },
    {
      key: 'details',
      type: 'textarea',
      section: 'second',
      label: label('Details'),
      visibleIf: { field: 'hasChanges', equals: true },
    },
    { key: 'eventDates', type: 'dateRange', section: 'third', label: label('Dates') },
  ],
  steps: [],
  active: true,
  version: 1,
};

function render(value: RequestFormModel = {}) {
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: { validation: { required: 'Required field' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
  });
  const fixture = TestBed.createComponent(DynamicForm);
  fixture.componentRef.setInput('type', TYPE);
  fixture.componentRef.setInput('value', value);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const keys = () =>
    Array.from(el.querySelectorAll('[data-testid="dynamic-field"]')).map((node) =>
      node.getAttribute('data-key'),
    );
  const field = (key: string) => el.querySelector(`[data-key="${key}"]`) as HTMLElement;
  return { fixture, el, keys, field };
}

describe('DynamicForm', () => {
  it('T2.2 renders one step per section with its localized title', () => {
    const { el } = render();
    const headers = Array.from(el.querySelectorAll('mat-step-header'));
    expect(headers.length).toBe(3);
    expect(headers[1].textContent).toContain('Beta section');
  });

  it('T2.2 renders the visible fields of every section', () => {
    const { keys } = render();
    expect(keys()).toEqual(['fullName', 'category', 'hasChanges', 'eventDates']);
  });

  it('T2.2 shows conditional fields when their condition matches', () => {
    const { fixture, keys } = render({ hasChanges: true });
    fixture.detectChanges();
    expect(keys()).toContain('details');
  });

  it('T2.2 writes user input into the value model', () => {
    const { fixture, field } = render();
    const input = field('fullName').querySelector('input') as HTMLInputElement;
    input.value = 'Layla';
    input.dispatchEvent(new Event('input'));
    expect(fixture.debugElement.componentInstance.value()).toMatchObject({ fullName: 'Layla' });
  });

  it('T2.2 fills missing keys with defaults', () => {
    const { fixture } = render({ fullName: 'Omar' });
    expect(fixture.debugElement.componentInstance.value()).toMatchObject({
      fullName: 'Omar',
      hasChanges: false,
      eventDates: { start: '', end: '' },
    });
  });

  it('T2.2 shows a translated error once a required field is touched', () => {
    const { fixture, field } = render();
    const input = field('fullName').querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(field('fullName').textContent).toContain('Required field');
  });

  it('T2.2 shows server-side errors for a field', () => {
    const { fixture, field } = render({ fullName: 'Omar' });
    fixture.componentRef.setInput('serverErrors', { fullName: ['validation.required'] });
    fixture.detectChanges();
    expect(field('fullName').textContent).toContain('Required field');
  });
});
