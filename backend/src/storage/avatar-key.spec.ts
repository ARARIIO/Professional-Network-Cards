import { describe, expect, it } from 'vitest';
import { avatarKeyFromPublicUrl, avatarObjectKey, isAvatarFileName } from './avatar-key.js';

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

  it('rejects foreign URLs', () => {
    expect(
      avatarKeyFromPublicUrl(
        'http://localhost:3000/storage/files',
        'http://cdn.example/avatars/user_1/abc.png',
      ),
    ).toBeNull();
  });

  it('checks file names', () => {
    expect(isAvatarFileName('x.webp')).toBe(true);
    expect(isAvatarFileName('../x.jpg')).toBe(false);
  });
});
