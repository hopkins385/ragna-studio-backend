import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  NestApplicationOptions,
} from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { SwaggerConfig } from './config/swagger.config';
import { HttpExceptionFilter } from './filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: AppModule.isDev
      ? ['log', 'error', 'warn', 'debug']
      : ['log', 'error', 'warn'],
    // bufferLogs: true,
    // bodyParser: false,
  });

  const reflector = app.get(Reflector);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  if (!AppModule.isDev) {
    app.useGlobalFilters(new HttpExceptionFilter());
  }

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
