import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module.js';
import { authRuntimeConfig } from './config/auth.config.js';
import { emitLog, emptyLogFields } from './common/logging/emit-log.js';
import { requestIdMiddleware } from './common/logging/request-id.middleware.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const config = authRuntimeConfig();
  app.use(requestIdMiddleware);
  app.use(cookieParser());
  app.enableCors({
    origin: config.frontendOrigin,
    credentials: true,
  });
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(config.port);
  emitLog({
    level: 'info',
    context: 'Bootstrap',
    msg: `listening on port ${String(config.port)}`,
    ...emptyLogFields(),
  });
}

await bootstrap();
