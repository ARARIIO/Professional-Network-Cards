export function stringOrNull(value: string | null): string | null {
  return typeof value === 'string' ? value : null;
}

export function booleanOrNull(value: boolean | null): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

export function numberOrNull(value: number | null): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function stringArrayOrNull(value: string[] | null): string[] | null {
  return Array.isArray(value) ? value : null;
}
