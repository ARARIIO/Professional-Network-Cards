import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '../../common/env.js';
import { readAccessToken } from '../../common/http/tokens.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import type { JwtAccessPayload } from '../../common/types/jwt-payload.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => readAccessToken(request),
      ]),
      ignoreExpiration: false,
      secretOrKey: env('JWT_SECRET'),
    });
  }

  validate(payload: JwtAccessPayload): AuthUser {
    if (payload.typ !== 'access') {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email };
  }
}
