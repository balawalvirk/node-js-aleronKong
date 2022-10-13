import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { PostsController } from './posts.controller';
import { PostSchema, Posts } from './posts.schema';
import { PostsService } from './posts.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Posts.name, schema: PostSchema }]), UsersModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
