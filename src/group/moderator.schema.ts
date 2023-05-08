import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Group } from './group.schema';

export type ModeratorDocument = Moderator & mongoose.Document;
@Schema({ timestamps: true })
export class Moderator {
  @Prop()
  nickName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true, default: true })
  acceptMemberRequests: boolean;

  @Prop({ required: true, default: true })
  removeMembers: boolean;

  @Prop({ required: true, default: true })
  banMembers: boolean;

  @Prop({ required: true, default: true })
  deletePosts: boolean;

  @Prop({ required: true, default: true })
  pinPosts: boolean;

  @Prop({ required: true, default: true })
  deleteComments: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true })
  group: Group;
}

export const ModeratorSchema = SchemaFactory.createForClass(Moderator);
