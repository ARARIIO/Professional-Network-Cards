export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';
export const AVATAR_MAX_BYTES = 50 * 1024 * 1024;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function avatarFileError(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Нужен файл JPEG, PNG или WebP';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Файл больше 50 МБ';
  }
  return null;
}

export function firstDroppedFile(list: FileList | null): File | null {
  if (list === null || list.length === 0) {
    return null;
  }
  return list.item(0);
}
