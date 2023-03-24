import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Chat } from 'src/chat/chat.schema';
import { Posts } from 'src/posts/posts.schema';
import { MuteInterval } from 'src/types';
import { User } from 'src/users/users.schema';

export type MuteDocument = Mute & mongoose.Document;
@Schema({ timestamps: true })
export class Mute {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' })
  post: Posts;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' })
  chat: Chat;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
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
