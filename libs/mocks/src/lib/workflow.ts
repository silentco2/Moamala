import { RequestType, StepDef } from '@moamala/shared/models';

export const HOUR_MS = 3_600_000;

export function firstStep(type: RequestType): StepDef | undefined {
  return type.steps[0];
}

export function findStep(type: RequestType, stepId: string | null): StepDef | undefined {
  return type.steps.find((step) => step.id === stepId);
}

export function nextStep(type: RequestType, stepId: string | null): StepDef | undefined {
  const index = type.steps.findIndex((step) => step.id === stepId);
  return index < 0 ? undefined : type.steps[index + 1];
}

export function dueAtFor(step: StepDef, enteredAt: Date): string {
  return new Date(enteredAt.getTime() + step.slaHours * HOUR_MS).toISOString();
}

/** `building_permit` + 12 -> `BP-2026-00012` */
export function refNoFor(type: RequestType, seq: number, year: number): string {
  const prefix = type.key
    .split('_')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  return `${prefix}-${year}-${String(seq).padStart(5, '0')}`;
}
