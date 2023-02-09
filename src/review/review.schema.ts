import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Order } from 'src/order/order.schema';
import { User } from 'src/users/users.schema';
import { Product } from '../product/product.schema';

export type ReviewDocument = Review & mongoose.Document;
@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  review: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creator: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  order: Order;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
