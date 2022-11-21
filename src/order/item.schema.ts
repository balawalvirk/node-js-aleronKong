import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from 'src/product/product.schema';
import { Order } from './order.schema';

export type OrderItemDocument = OrderItem & mongoose.Document;
@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ required: true })
  qty: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  order: Order;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
