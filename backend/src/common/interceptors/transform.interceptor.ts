import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type RestEnvelope<T> = {
  data: T;
};

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, T | RestEnvelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | RestEnvelope<T>> {
    if (context.getType<'http' | 'graphql'>() !== 'http') {
      return next.handle();
    }
    return next.handle().pipe(map((payload) => ({ data: payload })));
  }
}
