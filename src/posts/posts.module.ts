import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostSchema, Posts } from './posts.schema';
import { PostsService } from './posts.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Posts.name, schema: PostSchema }])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
