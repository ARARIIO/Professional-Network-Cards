import { describe, expect, it } from 'vitest';
import { isLogLevel, shouldLog } from './levels.js';

describe('log levels', () => {
  it('accepts only debug, info, warn, error', () => {
    expect(isLogLevel('info')).toBe(true);
    expect(isLogLevel('trace')).toBe(false);
  });

  it('filters below the configured minimum', () => {
    expect(shouldLog('debug', 'info')).toBe(false);
    expect(shouldLog('info', 'info')).toBe(true);
    expect(shouldLog('error', 'warn')).toBe(true);
  });
});
