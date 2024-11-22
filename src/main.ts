import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  NestApplicationOptions,
  ValidationPipe,
} from '@nestjs/common';
import { validationConfig } from './config/validation.config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { doubleCsrf } from 'csrf-csrf';
import { getCsrfOptions } from './config/csrf.config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as session from 'express-session';
import { getSessionConfig } from './config/session.config';
import { ConfigService } from '@nestjs/config';
import * as passport from 'passport';
import { SwaggerConfig } from './config/swagger.config';

const appConfig: NestApplicationOptions = {
  rawBody: true,
  logger: ['error', 'warn', 'log'],
  // bufferLogs: true,
  // bodyParser: false,
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    appConfig,
  );

  // app.use(cookieParser());

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // app.useGlobalPipes(new ValidationPipe(validationConfig));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enable('trust proxy', 'loopback');
  app.enableCors({
    origin: AppModule.origins,
    methods: ['POST', 'PATCH', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
  });

  // app.use(session(getSessionConfig(AppModule.isDev)));
  // app.use(passport.initialize());
  // app.use(passport.session());

  // const { doubleCsrfProtection } = doubleCsrf(getCsrfOptions(AppModule.isDev));
  // app.use(doubleCsrfProtection);

  if (AppModule.isDev) {
    SwaggerConfig(app, AppModule.apiPrefix);
  }

  app.setGlobalPrefix(AppModule.apiPrefix);
  app.disable('x-powered-by');
  app.enableShutdownHooks();

  await app.listen(AppModule.port);
}

bootstrap().then(() => {
  console.log('Server is running on port:', AppModule.port);
});
