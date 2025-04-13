import { ThrottlerExceptionFilter } from '@/filter/throttler-exception.filter';
import { JsonWebTokenErrorFilter } from '@/filter/token-exception.filter';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'body-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SwaggerConfig } from './config/swagger.config';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { ZodValidationExceptionFilter } from './filter/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger:
      process.env.APP_ENV !== 'dev' ? ['log', 'error', 'warn'] : ['log', 'error', 'warn', 'debug'],
    snapshot: false,
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

  app.use(json({ limit: '300kb' }));
  app.use(urlencoded({ limit: '300kb', extended: true }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ZodValidationExceptionFilter());
  app.useGlobalFilters(new ThrottlerExceptionFilter());
  app.useGlobalFilters(new JsonWebTokenErrorFilter());

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
