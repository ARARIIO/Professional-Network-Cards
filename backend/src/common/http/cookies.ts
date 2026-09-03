import type { CookieOptions } from 'express';
import { envOr } from '../env.js';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

export const ACCESS_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function authCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: envOr('NODE_ENV', 'development') === 'production',
    maxAge: maxAgeMs,
  };
}
