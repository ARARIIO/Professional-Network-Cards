export function normalizeEmail(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed;
}
