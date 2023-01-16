import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Posts } from 'src/posts/posts.schema';
import { User } from 'src/users/users.schema';

export type NotificationDocument = Notification & mongoose.Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  receiver: User;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' })
  post: Posts;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
