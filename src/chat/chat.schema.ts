import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ChatMuteType } from 'src/types';
import { User } from 'src/users/users.schema';

export type ChatDocument = Chat & mongoose.Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  members: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  mutedBy: User[];

  @Prop({ enum: ChatMuteType })
  muteType: string;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
