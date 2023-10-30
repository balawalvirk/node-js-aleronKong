import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeService } from 'src/helpers';
import { UsersModule } from 'src/users/users.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NotificationModule } from 'src/notification/notification.module';
import {Guild, GuildSchema} from "./guild.schema";
import {GuildController} from "./guild.controller";
import {GuildService} from "./guild.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Guild.name, schema: GuildSchema }]), UsersModule, NotificationModule],
  controllers: [GuildController],
  providers: [GuildService, StripeService, FirebaseService],
  exports: [GuildService],
})
export class GuildModule {}
