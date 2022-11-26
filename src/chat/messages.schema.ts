import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Chat } from './chat.schema';

export type MessageDocument = Message & mongoose.Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true })
  chat: Chat;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ required: true })
  content: string;

  @Prop()
  gif: string;

  @Prop({ type: [String] })
  videos: string[];

  @Prop({ type: [String] })
  images: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
