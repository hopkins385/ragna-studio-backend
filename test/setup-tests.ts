import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

// Configure global pipe for all tests
export const GlobalTestProviders = [
  {
    provide: APP_PIPE,
    useClass: ZodValidationPipe,
  },
];
