import { describe, expect, it } from 'vitest';
import { generateSlug } from './slug.generator.js';

describe('generateSlug', () => {
  it('returns a 12-character nanoid', () => {
    const slug = generateSlug();
    expect(slug.length).toBe(12);
    expect(generateSlug()).not.toBe(slug);
  });
});
