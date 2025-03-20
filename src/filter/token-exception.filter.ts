import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import { Response } from 'express';

@Catch(JsonWebTokenError)
export class JsonWebTokenErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(JsonWebTokenErrorFilter.name);

  catch(exception: JsonWebTokenError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response<any>>();
    const request = ctx.getRequest();

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
