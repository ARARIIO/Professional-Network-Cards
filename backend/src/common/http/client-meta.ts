import type { Request } from 'express';

export function clientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const first = forwarded.split(',')[0];
    if (typeof first === 'string' && first.trim().length > 0) {
      return first.trim();
    }
  }
  if (typeof req.ip === 'string' && req.ip.length > 0) {
    return req.ip;
  }
  return null;
}

export function clientUserAgent(req: Request): string | null {
  const ua = req.headers['user-agent'];
  if (typeof ua === 'string' && ua.length > 0) {
    return ua;
  }
  return null;
}
