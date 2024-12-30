import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { NO_TIMEOUT_KEY } from '../decorators/no-timeout.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout: number;

  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.defaultTimeout = this.config.get<number>(
      'API_TIMEOUT_IN_MILLISECONDS',
      30000,
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const noTimeout = this.reflector.get<boolean>(
      NO_TIMEOUT_KEY,
      context.getHandler(),
    );
    if (noTimeout) {
      return next.handle();
    }
    return next.handle().pipe(
      timeout(this.defaultTimeout),
      catchError((err) =>
        err instanceof TimeoutError
          ? throwError(() => new RequestTimeoutException())
          : throwError(() => err),
      ),
    );
  }
}
