import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvironmentVariables } from './types';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(new ConfigService<EnvironmentVariables>().get('MONGO_URI')),
    UserModule,
  ],
})
export class AppModule {}
