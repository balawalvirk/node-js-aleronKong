import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from 'src/chat/chat.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { GroupModule } from 'src/group/group.module';
import { StripeService } from 'src/helpers';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';
import { User, UserSchema } from 'src/users/users.schema';
import { FriendRequest, FriendRequestSchema } from './friend-request.schema';
import { FriendRequestService } from './friend-request.service';
import { UserController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: FriendRequest.name, schema: FriendRequestSchema }]),
    NotificationModule,
    FirebaseModule,
    OrderModule,
    ChatModule,
    ProductModule,
    GroupModule,
  ],
  controllers: [UserController],
  providers: [UsersService, StripeService, FriendRequestService],
  exports: [UsersService],
})
export class UsersModule {}
