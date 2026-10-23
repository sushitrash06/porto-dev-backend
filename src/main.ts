import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription(
      'Portfolio Management Backend API',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );

  SwaggerModule.setup(
    'api',
    app,
    document,
  );

  await app.listen(
    process.env.PORT ?? 8888,
  );
}

bootstrap();