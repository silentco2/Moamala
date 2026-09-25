import { Page } from '@moamala/shared/models';

export function toPage<T>(items: T[], params: URLSearchParams, defaultPageSize = 10): Page<T> {
  const pageSize = clamp(Number(params.get('pageSize')) || defaultPageSize, 1, 100);
  const page = Math.max(Number(params.get('page')) || 1, 1);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

/** Sorts by `field:direction` (e.g. `createdAt:desc`). Missing values sort last. */
export function sortBy<T>(items: T[], sort: string | null, fallback: string): T[] {
  const [field, direction] = (sort || fallback).split(':');
  const factor = direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = (a as Record<string, unknown>)[field];
    const right = (b as Record<string, unknown>)[field];
    if (left === right) return 0;
    if (left === undefined || left === null) return 1;
    if (right === undefined || right === null) return -1;
    return String(left).localeCompare(String(right), 'en', { numeric: true }) * factor;
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
