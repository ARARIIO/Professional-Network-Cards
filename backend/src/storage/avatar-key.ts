const USER_ID = /^[A-Za-z0-9_-]+$/;
const FILE_NAME = /^[A-Za-z0-9_-]+\.(jpg|png|webp)$/;

export function avatarPrefix(userId: string): string {
  return `avatars/${userId}/`;
}

export function avatarObjectKey(userId: string, fileName: string): string {
  return `${avatarPrefix(userId)}${fileName}`;
}

export function isAvatarUserId(userId: string): boolean {
  return USER_ID.test(userId);
}

export function isAvatarFileName(fileName: string): boolean {
  return FILE_NAME.test(fileName);
}

export function avatarKeyFromPublicUrl(
  publicBase: string,
  fileUrl: string,
): string | null {
  const base = publicBase.replace(/\/$/, '');
  const prefix = `${base}/`;
  if (fileUrl.startsWith(prefix) === false) {
    return null;
  }
  const key = fileUrl.slice(prefix.length);
  const parts = key.split('/');
  if (parts.length !== 3) {
    return null;
  }
  if (parts[0] !== 'avatars') {
    return null;
  }
  if (USER_ID.test(parts[1]) === false || FILE_NAME.test(parts[2]) === false) {
    return null;
  }
  return key;
}
