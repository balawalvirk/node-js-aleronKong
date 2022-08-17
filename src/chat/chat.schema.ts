import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type ChatDocument = Chat & mongoose.Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true })
  sender: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true })
  receiver: User;

  @Prop({ required: true })
  message: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
