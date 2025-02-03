import type { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerConfig } from './config/swagger.config';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { ZodValidationExceptionFilter } from './filter/zod-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger:
      process.env.APP_ENV !== 'dev'
        ? ['log', 'error', 'warn']
        : ['log', 'error', 'warn', 'debug'],
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

  app.useGlobalFilters(new ZodValidationExceptionFilter());

  if (!AppModule.isDev) {
    app.useGlobalFilters(new HttpExceptionFilter());
  }

  app.enable('trust proxy', 'loopback');
  app.enableCors({
    origin: AppModule.origins,
    methods: ['POST', 'PATCH', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
  });

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
