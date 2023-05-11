import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { GroupInvitationStatus } from 'src/types';
import { User } from 'src/users/users.schema';
import { Group } from './group.schema';

export type GroupInvitationDocument = GroupInvitation & mongoose.Document;

@Schema({ timestamps: true })
export class GroupInvitation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true })
  group: Group;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  friend: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ enum: GroupInvitationStatus, default: GroupInvitationStatus.PENDING })
  status: string;
}

export const GroupInvitationSchema = SchemaFactory.createForClass(GroupInvitation);
