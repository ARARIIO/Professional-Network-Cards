const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function extensionForMime(mimetype: string): string | null {
  const ext = MIME_TO_EXT[mimetype];
  if (typeof ext !== 'string') {
    return null;
  }
  return ext;
}
