import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequest } from '../http/get-request.js';
import type { AuthUser } from '../types/auth-user.js';

export const OptionalUser = createParamDecorator(
  (_data: string | null, context: ExecutionContext): AuthUser | null => {
    return getRequest(context).user;
  },
);
