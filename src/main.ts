// node_modules
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';

// internal
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  await app.register(helmet);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  await app.listen(port, (err, address) => console.log(`Server is running on ${address}`));
}
bootstrap();
