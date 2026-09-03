import { describe, expect, it } from 'vitest';
import { extensionForMime } from './mime.js';

describe('extensionForMime', () => {
  it('maps allowed image types', () => {
    expect(extensionForMime('image/jpeg')).toBe('jpg');
    expect(extensionForMime('image/png')).toBe('png');
    expect(extensionForMime('image/webp')).toBe('webp');
  });

  it('rejects other types', () => {
    expect(extensionForMime('application/pdf')).toBeNull();
    expect(extensionForMime('image/gif')).toBeNull();
  });
});
