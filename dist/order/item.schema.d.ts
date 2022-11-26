import * as mongoose from 'mongoose';
import { Product } from 'src/product/product.schema';
import { Order } from './order.schema';
export declare type OrderItemDocument = OrderItem & mongoose.Document;
export declare class OrderItem {
    product: Product;
    qty: number;
    price: number;
    order: Order;
}
export declare const OrderItemSchema: mongoose.Schema<OrderItem, mongoose.Model<OrderItem, any, any, any, any>, {}, {}, {}, {}, "type", OrderItem>;
