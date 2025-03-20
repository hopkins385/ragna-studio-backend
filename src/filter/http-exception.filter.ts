import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response<any>>();
    const exceptionStatusCode = exception.getStatus();
    const request = ctx.getRequest();

    // const errorResponse = exception.getResponse();
    // const errorMessage =
    //   typeof errorResponse === 'object' && 'message' in errorResponse
    //     ? (errorResponse as any).message
    //     : errorResponse;

    response.status(exceptionStatusCode).json({
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
