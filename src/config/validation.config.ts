import { ValidationPipeOptions } from '@nestjs/common';

export const validationConfig: ValidationPipeOptions = {
  errorHttpStatusCode: 422,
  whitelist: true,
  forbidNonWhitelisted: true,
  stopAtFirstError: true,
  transform: true,
};
