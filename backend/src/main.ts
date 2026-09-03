import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module.js';
import { authRuntimeConfig } from './config/auth.config.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = authRuntimeConfig();
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
}

await bootstrap();
