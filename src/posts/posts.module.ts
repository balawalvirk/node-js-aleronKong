import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { GroupModule } from 'src/group/group.module';
import { ModeratorService } from 'src/group/moderator.service';
import { NotificationModule } from 'src/notification/notification.module';
import { ReportModule } from 'src/report/report.module';
import { UsersModule } from 'src/users/users.module';
import { CommentSchema, Comment } from './comment.schema';
import { CommentService } from './comment.service';
import { PostsController } from './posts.controller';
import { PostSchema, Posts } from './posts.schema';
import { PostsService } from './posts.service';
import { Reaction, ReactionSchema } from './reaction.schema';
import { ReactionService } from './reaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Posts.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Reaction.name, schema: ReactionSchema }]),
    forwardRef(() => UsersModule),
    NotificationModule,
    FirebaseModule,
    forwardRef(() => GroupModule),
    ReportModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, CommentService, ReactionService],
  exports: [PostsService],
})
export class PostsModule {}
