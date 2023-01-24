import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Group } from 'src/group/group.schema';
import { Order } from 'src/order/order.schema';
import { Posts } from 'src/posts/posts.schema';
import { Product } from 'src/product/product.schema';
import { NotificationType } from 'src/types';
import { User } from 'src/users/users.schema';

export type NotificationDocument = Notification & mongoose.Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  receiver: User;

  @Prop({ enum: NotificationType, required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' })
  post: Posts;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  order: Order;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
  group: Group;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
