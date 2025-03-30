import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ThrottlerExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response<any>>();
    const exceptionStatusCode = exception.getStatus();
    const request = ctx.getRequest();

    const userIp = request.ips.length ? request.ips[0] : request.ip;
    this.logger.error(`${request.method} - ${request.url} - ip: ${userIp} `);

    response.status(exceptionStatusCode).json({
      message: 'Too many requests',
      timestamp: new Date().toISOString(),
    });
  }
}
