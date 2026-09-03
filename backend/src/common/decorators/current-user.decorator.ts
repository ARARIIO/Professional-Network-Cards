import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { getRequest } from '../http/get-request.js';
import type { AuthUser } from '../types/auth-user.js';

export const CurrentUser = createParamDecorator(
  (_data: string | null, context: ExecutionContext): AuthUser => {
    const request = getRequest(context);
    const user = request.user;
    if (user === null) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  },
);
