import { describe, expect, it } from 'vitest';
import { VIEW_RETENTION_DAYS, viewRetentionCutoff } from './retention.js';

describe('viewRetentionCutoff', () => {
  it('drops rows older than the chart window', () => {
    const now = new Date('2026-09-03T12:00:00.000Z');
    const cutoff = viewRetentionCutoff(now);
    expect(VIEW_RETENTION_DAYS).toBe(7);
    expect(now.getTime() - cutoff.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
