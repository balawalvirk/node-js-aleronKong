import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './group.schema';
import { PostsModule } from 'src/posts/posts.module';
import { FundraisingModule } from 'src/fundraising/fudraising.module';
import { NotificationModule } from 'src/notification/notification.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { Moderator, ModeratorSchema } from './moderator.schema';
import { ModeratorService } from './moderator.service';
import { MuteModule } from 'src/mute/mute.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    MongooseModule.forFeature([{ name: Moderator.name, schema: ModeratorSchema }]),
    forwardRef(() => PostsModule),
    FundraisingModule,
    NotificationModule,
    FirebaseModule,
    MuteModule,
  ],
  controllers: [GroupController],
  providers: [GroupService, ModeratorService],
  exports: [GroupService, ModeratorService],
})
export class GroupModule {}
