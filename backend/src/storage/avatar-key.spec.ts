import { describe, expect, it } from 'vitest';
import { avatarKeyFromPublicUrl, avatarObjectKey, isAvatarFileName, servedAvatarUrl } from './avatar-key.js';

describe('avatar keys', () => {
  it('builds object keys', () => {
    expect(avatarObjectKey('user_1', 'abc.jpg')).toBe('avatars/user_1/abc.jpg');
  });

  it('parses our public URLs', () => {
    const key = avatarKeyFromPublicUrl(
      'http://localhost:3000/storage/files',
      'http://localhost:3000/storage/files/avatars/user_1/abc.png',
    );
    expect(key).toBe('avatars/user_1/abc.png');
  });

  it('parses MinIO and API URLs', () => {
    expect(
      avatarKeyFromPublicUrl(
        'http://localhost:3000/storage/files',
        'http://localhost:9000/pnc-cards/avatars/user_1/abc.png',
      ),
    ).toBe('avatars/user_1/abc.png');
  });

  it('rewrites stored URLs onto the public file base', () => {
    expect(
      servedAvatarUrl(
        'http://localhost:3000/storage/files',
        'http://localhost:9000/pnc-cards/avatars/user_1/abc.png',
      ),
    ).toBe('http://localhost:3000/storage/files/avatars/user_1/abc.png');
  });

  it('checks file names', () => {
    expect(isAvatarFileName('x.webp')).toBe(true);
    expect(isAvatarFileName('../x.jpg')).toBe(false);
  });
});
