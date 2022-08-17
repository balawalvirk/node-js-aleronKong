import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema, Comment } from './comments.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }])],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
