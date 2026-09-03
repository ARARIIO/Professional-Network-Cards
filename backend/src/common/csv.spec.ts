import { describe, expect, it } from 'vitest';
import { parseCsv, parseCsvRow, toCsvRow } from './csv.js';

describe('csv', () => {
  it('round-trips quoted commas and quotes', () => {
    const row = toCsvRow(['Ada Lovelace', 'ada@example.com', 'a,b', 'say "hi"']);
    expect(parseCsvRow(row)).toEqual([
      'Ada Lovelace',
      'ada@example.com',
      'a,b',
      'say "hi"',
    ]);
  });

  it('parses multiline csv', () => {
    const text = `${toCsvRow(['name', 'email'])}\n${toCsvRow(['Ada', 'ada@example.com'])}`;
    expect(parseCsv(text)).toEqual([
      ['name', 'email'],
      ['Ada', 'ada@example.com'],
    ]);
  });
});
