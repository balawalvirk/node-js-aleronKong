import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { FriendRequestStatus } from 'src/types';
import { User } from './users.schema';

export type FriendRequestDocument = FriendRequest & Document;

@Schema({ timestamps: true })
export class FriendRequest {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver: User;

  @Prop({ enum: FriendRequestStatus, default: FriendRequestStatus.PENDING })
  status: string;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
