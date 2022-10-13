import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Posts } from 'src/posts/posts.schema';
import { User } from 'src/users/users.schema';
import { Member, memberSchema } from './member.schema';

export type GroupDocument = Group & mongoose.Document;
@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  coverPhoto: string;

  @Prop({ required: true })
  profilePhoto: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ enum: ['private', 'public'], required: true })
  privacy: string;

  @Prop({ type: [memberSchema] })
  members: Member[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }] })
  posts: Posts[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
