import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Address } from 'src/address/address.schema';
import { Product } from 'src/product/product.schema';
import { OrderStatus } from 'src/types';
import { User } from 'src/users/users.schema';

export type OrderDocument = Order & mongoose.Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  customer: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true })
  address: Address;

  @Prop({ required: true })
  total: number;

  @Prop({ default: OrderStatus.PENDING, enum: OrderStatus })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop()
  quantity: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
