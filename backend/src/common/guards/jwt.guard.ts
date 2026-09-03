import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { getRequest } from '../http/get-request.js';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override getRequest(context: ExecutionContext): Request {
    return getRequest(context);
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }
    return super.canActivate(context);
  }
}
