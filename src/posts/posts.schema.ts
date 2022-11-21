import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Group } from 'src/group/group.schema';
import { PostPrivacy, PostType } from 'src/types';
import { User } from 'src/users/users.schema';
import { CommentSchema, Comment } from './comment.schema';

export type PostDocument = Posts & mongoose.Document;
@Schema({ timestamps: true })
export class Posts {
  @Prop({ required: true })
  content: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes: User[];

  @Prop({ type: [CommentSchema] })
  comments: Comment[];

  @Prop({ required: true, type: [String] })
  media: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ enum: PostPrivacy, required: true })
  privacy: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  blockers: User[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reporter: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
  group: Group;

  @Prop({ enum: PostType, default: PostType.SIMPLE })
  type: string;
}

export const PostSchema = SchemaFactory.createForClass(Posts);
