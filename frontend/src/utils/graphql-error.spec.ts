import { describe, expect, it } from 'vitest';
import {
  EMAIL_TAKEN,
  SERVER_UNAVAILABLE,
  WRONG_CREDENTIALS,
  graphqlErrorMessage,
  translateServerMessage,
} from './graphql-error';

describe('translateServerMessage', () => {
  it('maps wrong login to Russian', () => {
    expect(translateServerMessage('Invalid credentials')).toBe(WRONG_CREDENTIALS);
    expect(translateServerMessage('Unauthorized')).toBe(WRONG_CREDENTIALS);
    expect(translateServerMessage('Response not successful: Received status code 401')).toBe(
      WRONG_CREDENTIALS,
    );
  });

  it('maps taken email to Russian', () => {
    expect(translateServerMessage('Email already registered')).toBe(EMAIL_TAKEN);
  });

  it('maps transport failures to Russian', () => {
    expect(translateServerMessage('Failed to fetch')).toBe(SERVER_UNAVAILABLE);
    expect(translateServerMessage('Response not successful: Received status code 502')).toBe(
      SERVER_UNAVAILABLE,
    );
  });
});

describe('graphqlErrorMessage', () => {
  it('reads Error.message', () => {
    expect(graphqlErrorMessage(new Error('Invalid credentials'))).toBe(WRONG_CREDENTIALS);
  });
});
