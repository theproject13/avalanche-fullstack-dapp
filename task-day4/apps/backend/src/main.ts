import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Enable CORS for the frontend (safer defaults)
  // If CORS_ORIGIN is set, allow listed origins and enable credentials.
  // Otherwise, allow '*' and disable credentials to satisfy browser CORS rules.
  const corsOriginEnv = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : undefined;

  const hasCustomOrigins = !!(corsOriginEnv && corsOriginEnv.length > 0);

  app.enableCors({
    origin: hasCustomOrigins ? corsOriginEnv : '*',
    credentials: hasCustomOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Backend API Moh Iqbal Baharsyah')
    .setDescription('Blockchain API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
}
void bootstrap();
