import {
  DateRangeValue,
  FIELD_KEY_PATTERN,
  FieldDef,
  RequestType,
  RequestTypeInput,
  TYPE_KEY_PATTERN,
} from '@moamala/shared/models';
import { FieldErrors } from './responses';

export function isFieldVisible(field: FieldDef, data: Record<string, unknown>): boolean {
  return !field.visibleIf || data[field.visibleIf.field] === field.visibleIf.equals;
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '' || value === false;
}

function isDateRange(value: unknown): value is DateRangeValue {
  return typeof value === 'object' && value !== null && 'start' in value && 'end' in value;
}

/** Server-side validation of a submitted request against its type's field schema. */
export function validateRequestData(type: RequestType, data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  const add = (key: string, message: string) => (errors[key] ??= []).push(message);

  for (const field of type.fields) {
    if (!isFieldVisible(field, data)) continue;
    const value = data[field.key];
    if (isEmpty(value)) {
      if (field.required) add(field.key, 'validation.required');
      continue;
    }
    if (field.pattern && !new RegExp(field.pattern).test(String(value))) {
      add(field.key, 'validation.pattern');
    }
    if (field.type === 'number') {
      const number = Number(value);
      if (field.min !== undefined && number < field.min) add(field.key, 'validation.min');
      if (field.max !== undefined && number > field.max) add(field.key, 'validation.max');
    }
    if (field.type === 'select' && !field.options?.some((option) => option.value === value)) {
      add(field.key, 'validation.option');
    }
    if (field.type === 'dateRange') {
      if (!isDateRange(value) || !value.start || !value.end) {
        if (field.required) add(field.key, 'validation.required');
      } else if (value.end < value.start) {
        add(field.key, 'validation.dateRange');
      }
    }
  }
  return errors;
}

/** Server-side validation of a request type coming from the admin designer. */
export function validateRequestType(
  input: RequestTypeInput,
  existing: RequestType[],
  excludeId?: string,
): FieldErrors {
  const errors: FieldErrors = {};
  const add = (key: string, message: string) => (errors[key] ??= []).push(message);

  if (!TYPE_KEY_PATTERN.test(input.key ?? '')) add('key', 'validation.key');
  if (existing.some((type) => type.key === input.key && type.id !== excludeId)) {
    add('key', 'validation.keyTaken');
  }
  if (!input.name?.en?.trim() || !input.name?.ar?.trim()) add('name', 'validation.localized');
  if (!input.sections?.length) add('sections', 'validation.minItems');
  if (!input.fields?.length) add('fields', 'validation.minItems');
  if (!input.steps?.length) add('steps', 'validation.minItems');

  const sectionIds = new Set((input.sections ?? []).map((section) => section.id));
  const fieldKeys = new Set<string>();
  (input.fields ?? []).forEach((field, index) => {
    if (!FIELD_KEY_PATTERN.test(field.key)) add(`fields.${index}.key`, 'validation.key');
    if (fieldKeys.has(field.key)) add(`fields.${index}.key`, 'validation.duplicate');
    fieldKeys.add(field.key);
    if (!sectionIds.has(field.section)) add(`fields.${index}.section`, 'validation.option');
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
      add(`fields.${index}.max`, 'validation.minMax');
    }
  });
  (input.steps ?? []).forEach((step, index) => {
    if (!(step.slaHours > 0)) add(`steps.${index}.slaHours`, 'validation.min');
    if (!step.actions?.length) add(`steps.${index}.actions`, 'validation.minItems');
  });
  return errors;
}

export const hasErrors = (errors: FieldErrors) => Object.keys(errors).length > 0;
