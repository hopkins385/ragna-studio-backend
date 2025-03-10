import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response<any>>();
    const status = exception.getStatus();
    const request = ctx.getRequest();

    const errorResponse = exception.getResponse();
    const errorMessage =
      typeof errorResponse === 'object' && 'message' in errorResponse
        ? (errorResponse as any).message
        : errorResponse;
    this.logger.error(
      `HTTP Exception: ${request.method} ${request.url} - ${status} - ${errorMessage}`,
      exception.stack,
    );
    this.logger.debug(`Request Body: ${JSON.stringify(request.body)}`);
    this.logger.debug(`Request Params: ${JSON.stringify(request.params)}`);
    this.logger.debug(`Request Query: ${JSON.stringify(request.query)}`);
    this.logger.debug(`Request Headers: ${JSON.stringify(request.headers)}`);
    this.logger.debug(`Request IP: ${request.ip}`);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
