const PUBLIC_CARD_PATH = /^\/c\/[A-Za-z0-9_-]+$/;

export function postAuthPath(next: string | null): string {
  if (next === null) {
    return '/dashboard';
  }
  if (PUBLIC_CARD_PATH.test(next)) {
    return next;
  }
  return '/dashboard';
}
