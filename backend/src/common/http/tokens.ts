import type { Request } from 'express';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './cookies.js';

function readCookie(req: Request, name: string): string | null {
  const cookies = req.cookies;
  if (cookies === null || typeof cookies !== 'object') {
    return null;
  }
  if (!(name in cookies)) {
    return null;
  }
  const value = cookies[name];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return null;
}

export function readAccessToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);
    if (token.length > 0) {
      return token;
    }
  }
  return readCookie(req, ACCESS_COOKIE);
}

export function readRefreshToken(req: Request): string | null {
  return readCookie(req, REFRESH_COOKIE);
}
