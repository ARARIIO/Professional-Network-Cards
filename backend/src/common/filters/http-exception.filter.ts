import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | Error, host: ArgumentsHost): void {
    if (host.getType<'http' | 'graphql'>() === 'graphql') {
      throw exception;
    }

    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        response.status(status).json({ message: body, statusCode: status });
        return;
      }
      response.status(status).json(body);
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
