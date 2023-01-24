import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './group.schema';
import { PostsModule } from 'src/posts/posts.module';
import { FundraisingModule } from 'src/fundraising/fudraising.module';
import { NotificationModule } from 'src/notification/notification.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    PostsModule,
    FundraisingModule,
    NotificationModule,
    FirebaseModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
