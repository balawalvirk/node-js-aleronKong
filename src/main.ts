import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(helmet());
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  await app.listen(port, () => console.log(`listening on port ${port}`));
}
bootstrap();
