import { API_URL } from '../constants';

const AVATAR_IN_URL =
  /(?:^|\/)(avatars\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.(?:jpg|png|webp))(?:\?.*)?$/;

export function resolveAvatarSrc(stored: string | null): string | null {
  if (stored === null || stored.length === 0) {
    return null;
  }
  const match = stored.match(AVATAR_IN_URL);
  if (match === null) {
    return stored;
  }
  return `${API_URL}/storage/files/${match[1]}`;
}
