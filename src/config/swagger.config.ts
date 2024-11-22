import { AUTH_OPTIONS, TOKEN_NAME } from '../modules/auth/constants';
import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

const title = 'RAGNA API';
const description = 'This is the backend API for the application.';

/**
 * Setup swagger in the application
 * @param app {INestApplication}
 */
export const SwaggerConfig = (app: INestApplication, apiPrefix: string) => {
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .addBearerAuth(AUTH_OPTIONS, TOKEN_NAME)
    .build();

  const options: SwaggerDocumentOptions = {
    deepScanRoutes: false,
    // includeControllerTag: true,
    // operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  patchNestJsSwagger();

  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });
};
