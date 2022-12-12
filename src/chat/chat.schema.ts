import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MuteInterval } from 'src/types';
import { User } from 'src/users/users.schema';
import { Message } from './messages.schema';

export type ChatDocument = Chat & mongoose.Document;

@Schema({ timestamps: true })
export class Mute {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop()
  date: Date;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ enum: MuteInterval, required: true })
  interval: string;
}

export const MuteSchema = SchemaFactory.createForClass(Mute);

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  members: User[];

  @Prop({ type: MuteSchema })
  mutes: Mute[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
  lastMessage: Message;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
