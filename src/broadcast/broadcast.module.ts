import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Broadcast, BroadcastSchema } from './broadcast.schema';
import { SocketGateway } from 'src/helpers';
import { HttpModule } from '@nestjs/axios';
import { PostsModule } from 'src/posts/posts.module';
import {PageService} from "src/page/page.service";
import {Page, PageSchema} from "src/page/page.schema";
import {Comment, CommentSchema} from "src/posts/comment.schema";
import {CommentService} from "src/posts/comment.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Broadcast.name, schema: BroadcastSchema }]),
      MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
      MongooseModule.forFeature([{name: Comment.name, schema: CommentSchema}]),
      HttpModule, PostsModule],
  controllers: [BroadcastController],
  providers: [BroadcastService, SocketGateway,PageService,CommentService],
})
export class BroadcastModule {}
