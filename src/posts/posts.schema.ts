import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Comment } from 'src/posts/comments/comments.schema';

export type PostDocument = Posts & mongoose.Document;

@Schema({ timestamps: true })
export class Posts {
  @Prop({ required: true })
  content: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];

  @Prop({ required: true })
  media: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creator: User;
}

export const PostSchema = SchemaFactory.createForClass(Posts);
