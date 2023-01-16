import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Posts } from './posts.schema';

export type CommentDocument = Comment & mongoose.Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' })
  post: Posts;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
