import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { CanActivate } from '@nestjs/common';
import { env } from '../env.js';
import { getRequest } from '../http/get-request.js';
import { readAccessToken } from '../http/tokens.js';
import type { AuthUser } from '../types/auth-user.js';
import type { JwtAccessPayload } from '../types/jwt-payload.js';

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = getRequest(context);
    const token = readAccessToken(request);
    if (token === null) {
      request.user = null;
      return true;
    }
    try {
      const payload = this.jwtService.verify<JwtAccessPayload>(token, {
        secret: env('JWT_SECRET'),
      });
      if (payload.typ !== 'access') {
        request.user = null;
        return true;
      }
      const user: AuthUser = { id: payload.sub, email: payload.email };
      request.user = user;
    } catch {
      request.user = null;
    }
    return true;
  }
}
