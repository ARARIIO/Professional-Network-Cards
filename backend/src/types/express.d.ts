import type { AuthUser } from '../common/types/auth-user.js';

declare module 'express-serve-static-core' {
  interface Request {
    user: AuthUser | null;
  }
}
