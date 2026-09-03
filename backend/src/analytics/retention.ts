export const VIEW_RETENTION_DAYS = 7;

export function viewRetentionCutoff(now: Date): Date {
  return new Date(now.getTime() - VIEW_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}
