import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Group } from 'src/group/group.schema';
import { User } from 'src/users/users.schema';
import { CommentSchema } from './comment.schema';

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creator: User;

  @Prop({ enum: ['guildMembers', 'public', 'followers'], required: true })
  privacy: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  blockers: User[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reporter: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
  group: Group;
}

export const PostSchema = SchemaFactory.createForClass(Posts);
