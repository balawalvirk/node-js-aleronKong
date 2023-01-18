import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Address } from 'src/address/address.schema';
import { Product } from 'src/product/product.schema';
import { Review } from 'src/product/review.schema';
import { OrderStatus } from 'src/types';
import { User } from 'src/users/users.schema';

export type OrderDocument = Order & mongoose.Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  customer: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  seller: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true })
  address: Address;

  @Prop({ default: OrderStatus.PENDING, enum: OrderStatus })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop()
  selectedColor: string;

  @Prop()
  selectedSize: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: 1 })
  quantity: number;

  @Prop()
  paymentIntent: string;

  @Prop({ required: true })
  orderNumber: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Review' })
  review: Review;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
