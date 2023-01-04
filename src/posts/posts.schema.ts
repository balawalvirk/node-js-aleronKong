import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Mute, MuteSchema } from 'src/chat/chat.schema';
import { Fundraising } from 'src/fundraising/fundraising.schema';
import { Group } from 'src/group/group.schema';
import { PostPrivacy, PostStatus, PostType } from 'src/types';
import { User } from 'src/users/users.schema';
import { CommentSchema, Comment } from './comment.schema';

export type PostDocument = Posts & mongoose.Document;
@Schema({ timestamps: true })
export class Posts {
  @Prop()
  content: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes: User[];

  @Prop({ type: [CommentSchema] })
  comments: Comment[];

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: [String] })
  videos: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ enum: PostPrivacy, required: true })
  privacy: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ enum: PostStatus, default: PostStatus.ACTIVE })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
  group: Group;

  @Prop({ enum: PostType, default: PostType.POST })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Fundraising' })
  fundraising: Fundraising;

  @Prop({ type: MuteSchema })
  mutes: Mute[];
}

export const PostSchema = SchemaFactory.createForClass(Posts);
