import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './group.schema';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]), PostsModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
