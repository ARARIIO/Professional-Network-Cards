import { describe, expect, it } from 'vitest';
import { formatLogTime } from './format-log-time.js';

describe('formatLogTime', () => {
  it('uses local date and offset instead of UTC ISO', () => {
    const date = new Date('2026-09-03T07:56:12.549Z');
    const formatted = formatLogTime(date);
    expect(formatted).not.toContain('T');
    expect(formatted).not.toMatch(/Z$/);
    expect(formatted).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{2}:\d{2}$/,
    );
  });
});
