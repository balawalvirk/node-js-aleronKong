import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Address } from 'src/address/address.schema';
import { Product } from 'src/product/product.schema';
import { OrderStatus } from 'src/types';
import { User } from 'src/users/users.schema';

export type OrderDocument = Order & mongoose.Document;

@Schema({ versionKey: false, _id: false })
class Item {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  item: Product;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

const ItemSchema = SchemaFactory.createForClass(Item);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  customer: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true })
  address: Address;

  @Prop({ required: true })
  subTotal: number;

  @Prop({ required: true })
  paymentIntent: string;

  @Prop({ default: OrderStatus.PENDING, enum: OrderStatus })
  status: string;

  @Prop({ type: [ItemSchema] })
  items: Item[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
