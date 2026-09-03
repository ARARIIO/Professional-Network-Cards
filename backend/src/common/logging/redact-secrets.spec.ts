import { describe, expect, it } from 'vitest';
import { redactSecrets } from './redact-secrets.js';

describe('redactSecrets', () => {
  it('strips postgres URLs and bearer tokens', () => {
    expect(
      redactSecrets(
        'fail postgresql://root@localhost:26257/pnc_db?sslmode=disable Bearer abc.def',
      ),
    ).toBe('fail postgresql://*** Bearer ***');
  });
});
