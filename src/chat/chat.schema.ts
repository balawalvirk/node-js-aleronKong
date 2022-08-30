import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Message } from './messages.schema';

export type ChatDocument = Chat & mongoose.Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] })
  messages: Message[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User'  })
  sender: User;


  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User'  })
  receiver: User;


}

export const ChatSchema = SchemaFactory.createForClass(Chat);
