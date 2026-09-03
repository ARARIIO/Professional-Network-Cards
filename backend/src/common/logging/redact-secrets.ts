export function redactSecrets(text: string): string {
  return text
    .replace(/postgresql:\/\/[^\s"'\\]+/gi, 'postgresql://***')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer ***');
}
