import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Mute, MuteSchema } from 'src/chat/chat.schema';
import { Posts } from 'src/posts/posts.schema';
import { GroupPrivacy } from 'src/types';
import { User } from 'src/users/users.schema';
import { Member, MemberSchema } from './member.schema';
import { Report, ReportSchema } from './report.schema';

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

  @Prop({ enum: GroupPrivacy, required: true })
  privacy: string;

  @Prop({ type: [MemberSchema] })
  members: Member[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }] })
  posts: Posts[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true })
  requests: User[];

  @Prop({ type: [ReportSchema] })
  reports: Report[];

  @Prop({ type: MuteSchema })
  mutes: Mute[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
