import { describe, expect, it } from 'vitest';
import { publicApiUrl, publicGraphqlUrl } from './constants';

describe('public urls', () => {
  it('uses relative GraphQL path in production when env is empty', () => {
    expect(publicGraphqlUrl(true, null)).toBe('/graphql');
    expect(publicGraphqlUrl(true, '')).toBe('/graphql');
  });

  it('keeps localhost GraphQL in development', () => {
    expect(publicGraphqlUrl(false, null)).toBe('http://localhost:3000/graphql');
  });

  it('uses same-origin API in production when env is missing', () => {
    expect(publicApiUrl(true, null)).toBe('');
    expect(publicApiUrl(true, '')).toBe('');
  });

  it('strips a trailing slash from an explicit API origin', () => {
    expect(publicApiUrl(true, 'https://api.example/')).toBe('https://api.example');
  });
});
