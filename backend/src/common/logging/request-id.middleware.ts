import { nanoid } from 'nanoid';
import type { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers['x-request-id'];
  if (typeof header === 'string' && header.length > 0) {
    req.requestId = header.slice(0, 64);
  } else {
    req.requestId = nanoid(12);
  }
  res.setHeader('x-request-id', req.requestId);
  next();
}

export function readRequestId(req: Request): string | null {
  if (typeof req.requestId === 'string' && req.requestId.length > 0) {
    return req.requestId;
  }
  return null;
}
