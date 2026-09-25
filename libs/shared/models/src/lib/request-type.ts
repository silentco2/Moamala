import { Localized } from './i18n';
import { Role } from './user';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'dateRange'
  | 'select'
  | 'checkbox'
  | 'file';

export const FIELD_TYPES: readonly FieldType[] = [
  'text',
  'textarea',
  'number',
  'date',
  'dateRange',
  'select',
  'checkbox',
  'file',
];

export interface FieldOption {
  value: string;
  label: Localized;
}

export interface VisibleIf {
  field: string;
  equals: unknown;
}

export interface FieldDef {
  key: string;
  type: FieldType;
  label: Localized;
  section: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  options?: FieldOption[];
  visibleIf?: VisibleIf;
}

/** Value stored for a `dateRange` field. Dates are ISO `yyyy-mm-dd` strings. */
export interface DateRangeValue {
  start: string;
  end: string;
}

export type StepRole = Exclude<Role, 'applicant' | 'admin'>;

export type DecisionAction = 'forward' | 'return' | 'approve' | 'reject';

export const DECISION_ACTIONS: readonly DecisionAction[] = ['forward', 'return', 'approve', 'reject'];

export interface StepDef {
  id: string;
  name: Localized;
  role: StepRole;
  slaHours: number;
  actions: DecisionAction[];
}

export interface FormSection {
  id: string;
  title: Localized;
}

export interface RequestType {
  id: string;
  key: string;
  name: Localized;
  description: Localized;
  sections: FormSection[];
  fields: FieldDef[];
  steps: StepDef[];
  active: boolean;
  version: number;
}

/** Payload for creating or updating a request type (server assigns `id` and `version`). */
export type RequestTypeInput = Omit<RequestType, 'id' | 'version'>;

/** Request type keys are snake_case, e.g. `building_permit`. */
export const TYPE_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

/** Field keys are camelCase, e.g. `ownerName`. They become keys of `ServiceRequest.data`. */
export const FIELD_KEY_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
