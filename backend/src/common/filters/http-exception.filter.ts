import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { getRequestFromHost } from '../http/get-request.js';
import { emitLog } from '../logging/emit-log.js';
import { readRequestId } from '../logging/request-id.middleware.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | Error, host: ArgumentsHost): void {
    const req = getRequestFromHost(host);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    emitLog({
      level: status >= HttpStatus.INTERNAL_SERVER_ERROR ? 'error' : 'warn',
      context: 'HTTP',
      msg: exception instanceof HttpException ? exception.message : 'Unhandled exception',
      requestId: readRequestId(req),
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status,
      ms: null,
      operation: null,
    });

    if (host.getType<'http' | 'graphql'>() === 'graphql') {
      throw exception;
    }

    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        response.status(status).json({ message: body, statusCode: status });
        return;
      }
      response.status(status).json(body);
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
