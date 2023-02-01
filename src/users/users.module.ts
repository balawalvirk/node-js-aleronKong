import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { StripeService } from 'src/helpers';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderModule } from 'src/order/order.module';
import { User, UserSchema } from 'src/users/users.schema';
import { UserController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), NotificationModule, FirebaseModule, OrderModule],
  controllers: [UserController],
  providers: [UsersService, StripeService],
  exports: [UsersService],
})
export class UsersModule {}
