import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { IEnvironmentVariables } from './types';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { ChatModule } from './chat/chat.module';
import { ProductModule } from './product/product.module';
import { GroupModule } from './group/group.module';
import { PackageModule } from './package/package.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(new ConfigService<IEnvironmentVariables>().get('MONGO_URI')),
    UsersModule,
    AuthModule,
    PostsModule,
    ChatModule,
    ProductModule,
    GroupModule,
    PackageModule,
    PaymentMethodModule,
    AddressModule,
  ],
})
export class AppModule {}
