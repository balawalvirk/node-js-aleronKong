import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  await app.register(helmet);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  // remove address when deploy application to production server
  await app.listen(port, '0.0.0.0', (err, address) =>
    console.log(`Server is running on ${address}`)
  );
}
bootstrap();
