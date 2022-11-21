import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Address } from 'src/address/address.schema';
import { User } from 'src/users/users.schema';
import { OrderItem } from './item.schema';

export type OrderDocument = Order & mongoose.Document;
@Schema({ timestamps: true })
export class Order {
  @Prop()
  note: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  customer: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true })
  address: Address;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }] })
  orderItems: OrderItem;

  @Prop({ required: true })
  subTotal: number;

  @Prop()
  discount: number;

  @Prop()
  shippingRate: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
