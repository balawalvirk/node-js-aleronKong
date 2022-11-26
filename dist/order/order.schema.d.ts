import * as mongoose from 'mongoose';
import { Address } from 'src/address/address.schema';
import { User } from 'src/users/users.schema';
import { OrderItem } from './item.schema';
export declare type OrderDocument = Order & mongoose.Document;
export declare class Order {
    note: string;
    customer: User;
    address: Address;
    orderItems: OrderItem;
    subTotal: number;
    discount: number;
    shippingRate: number;
}
export declare const OrderSchema: mongoose.Schema<Order, mongoose.Model<Order, any, any, any, any>, {}, {}, {}, {}, "type", Order>;
