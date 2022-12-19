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
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './helpers';
import { OrderModule } from './order/order.module';
import { FileModule } from './file/file.module';
import { FudraisingModule } from './fundraising/fudraising.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';
import { GuildPackageModule } from './guild-package/guild-package.module';
import { SearchModule } from './search/search.module';
import { SaleModule } from './sale/sale.module';

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
    OrderModule,
    FileModule,
    FudraisingModule,
    NotificationModule,
    ReportModule,
    GuildPackageModule,
    SearchModule,
    SaleModule,
  ],
  // global interceptor for transforming response.
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
