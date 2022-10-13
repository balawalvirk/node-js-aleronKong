import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type ChatDocument = Chat & mongoose.Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  members: User[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
