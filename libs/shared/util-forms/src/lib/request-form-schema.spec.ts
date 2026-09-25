import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { FieldDef } from '@moamala/shared/models';
import { isFieldVisible, RequestFormModel, requestTypeSchema } from './request-form-schema';

const label = { en: 'Label', ar: 'تسمية' };

const FIELDS: FieldDef[] = [
  { key: 'fullName', type: 'text', section: 'a', label, required: true },
  { key: 'nationalId', type: 'text', section: 'a', label, pattern: '^\\d{10}$' },
  { key: 'floors', type: 'number', section: 'a', label, min: 1, max: 10 },
  { key: 'hasChanges', type: 'checkbox', section: 'b', label },
  {
    key: 'changeDetails',
    type: 'textarea',
    section: 'b',
    label,
    required: true,
    visibleIf: { field: 'hasChanges', equals: true },
  },
  { key: 'eventDates', type: 'dateRange', section: 'b', label, required: true },
];

function createForm(value: RequestFormModel) {
  const model = signal<RequestFormModel>(value);
  const tree = form(model, requestTypeSchema(FIELDS), { injector: TestBed.inject(Injector) });
  const kinds = (key: string) => (tree[key]?.().errors() ?? []).map((error) => error.kind);
  return { model, tree, kinds };
}

const valid: RequestFormModel = {
  fullName: 'Sara',
  nationalId: '1234567890',
  floors: 3,
  hasChanges: false,
  changeDetails: '',
  eventDates: { start: '2026-05-01', end: '2026-05-03' },
};

describe('requestTypeSchema', () => {
  it('T2.2 accepts a valid model', () => {
    const { tree } = createForm(valid);
    expect(tree().valid()).toBe(true);
    const { kinds } = createForm({ ...valid, fullName: '' });
    expect(kinds('fullName')).toContain('required');
  });

  it('T2.2 applies pattern, min and max rules', () => {
    const { kinds, model } = createForm({ ...valid, nationalId: '12ab', floors: 0 });
    expect(kinds('nationalId')).toContain('pattern');
    expect(kinds('floors')).toContain('min');
    model.update((value) => ({ ...value, floors: 11 }));
    expect(kinds('floors')).toContain('max');
  });

  it('T2.2 hides conditional fields and does not validate them while hidden', () => {
    const { tree, kinds, model } = createForm(valid);
    expect(tree['changeDetails']?.().hidden()).toBe(true);
    expect(kinds('changeDetails')).toEqual([]);

    model.update((value) => ({ ...value, hasChanges: true }));
    expect(tree['changeDetails']?.().hidden()).toBe(false);
    expect(kinds('changeDetails')).toContain('required');
  });

  it('T2.2 rejects a date range that ends before it starts', () => {
    const { kinds } = createForm({ ...valid, eventDates: { start: '2026-05-03', end: '2026-05-01' } });
    expect(kinds('eventDates')).toContain('dateRange');
  });
});

describe('isFieldVisible', () => {
  it('T2.2 evaluates visibleIf against the current value', () => {
    const field = FIELDS[4];
    expect(isFieldVisible(field, { hasChanges: true })).toBe(true);
    expect(isFieldVisible(field, { hasChanges: false })).toBe(false);
    expect(isFieldVisible(FIELDS[0], {})).toBe(true);
  });
});
