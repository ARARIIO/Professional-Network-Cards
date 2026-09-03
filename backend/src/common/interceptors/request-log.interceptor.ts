import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getRequest, getResponse } from '../http/get-request.js';
import { emitLog } from '../logging/emit-log.js';
import { readRequestId } from '../logging/request-id.middleware.js';

@Injectable()
export class RequestLogInterceptor<T> implements NestInterceptor<T, T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const started = Date.now();
    const req = getRequest(context);
    const res = getResponse(context);
    return next.handle().pipe(
      tap(() => {
        writeRequestLog(req, res, started);
      }),
    );
  }
}

function writeRequestLog(req: Request, res: Response, started: number): void {
  const path = req.originalUrl.split('?')[0];
  if (path === '/health') {
    return;
  }
  emitLog({
    level: 'info',
    context: 'HTTP',
    msg: 'ok',
    requestId: readRequestId(req),
    method: req.method,
    path,
    status: res.statusCode,
    ms: Date.now() - started,
    operation: graphqlOperation(req),
  });
}

function graphqlOperation(req: Request): string | null {
  if (req.originalUrl.split('?')[0] !== '/graphql') {
    return null;
  }
  const body = req.body;
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }
  return operationNameFromBody(body);
}

function operationNameFromBody(body: object): string | null {
  if (Object.prototype.hasOwnProperty.call(body, 'operationName') === false) {
    return null;
  }
  const named = body as { operationName: string | null };
  if (typeof named.operationName !== 'string' || named.operationName.length === 0) {
    return null;
  }
  return named.operationName;
}
