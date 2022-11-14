import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeService } from 'src/helpers';
import { User, UserSchema } from 'src/users/users.schema';
import { UserController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UsersService, StripeService],
  exports: [UsersService],
})
export class UsersModule {}
