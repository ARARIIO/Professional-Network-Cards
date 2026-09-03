import { describe, expect, it } from 'vitest';
import { postAuthPath } from './post-auth-path';

describe('postAuthPath', () => {
  it('returns dashboard when next is missing or unsafe', () => {
    expect(postAuthPath(null)).toBe('/dashboard');
    expect(postAuthPath('/dashboard')).toBe('/dashboard');
    expect(postAuthPath('https://evil.test')).toBe('/dashboard');
    expect(postAuthPath('/c/../auth')).toBe('/dashboard');
  });

  it('allows a public card path', () => {
    expect(postAuthPath('/c/alex-ivanova')).toBe('/c/alex-ivanova');
  });
});
