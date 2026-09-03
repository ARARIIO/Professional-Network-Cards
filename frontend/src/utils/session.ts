import { API_URL } from '../constants';

let inflight: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  if (inflight !== null) {
    return inflight;
  }
  inflight = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
