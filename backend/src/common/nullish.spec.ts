import { describe, expect, it } from 'vitest';
import {
  booleanOrNull,
  numberOrNull,
  stringArrayOrNull,
  stringOrNull,
} from './nullish.js';

describe('nullish helpers', () => {
  it('keeps strings and maps missing values to null', () => {
    expect(stringOrNull('ok')).toBe('ok');
    expect(stringOrNull(null)).toBeNull();
  });

  it('accepts finite numbers only', () => {
    expect(numberOrNull(3)).toBe(3);
    expect(numberOrNull(null)).toBeNull();
    expect(numberOrNull(Number.NaN)).toBeNull();
  });

  it('accepts booleans and arrays', () => {
    expect(booleanOrNull(true)).toBe(true);
    expect(booleanOrNull(null)).toBeNull();
    expect(stringArrayOrNull(['a'])).toEqual(['a']);
    expect(stringArrayOrNull(null)).toBeNull();
  });
});
