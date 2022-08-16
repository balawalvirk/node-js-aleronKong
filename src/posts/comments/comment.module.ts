import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsSchema, Comment } from './comments.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Comment.name, schema: CommentsSchema }])],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
