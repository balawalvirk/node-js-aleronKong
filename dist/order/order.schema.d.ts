import * as mongoose from 'mongoose';
import { Address } from 'src/address/address.schema';
import { Product } from 'src/product/product.schema';
import { User } from 'src/users/users.schema';
export declare type OrderDocument = Order & mongoose.Document;
export declare class Order {
    customer: User;
    seller: User;
    address: Address;
    status: string;
    product: Product;
    selectedColor: string;
    selectedSize: string;
    paymentMethod: string;
    quantity: number;
    paymentIntent: string;
    orderNumber: number;
}
export declare const OrderSchema: mongoose.Schema<Order, mongoose.Model<Order, any, any, any, any>, {}, {}, {}, {}, "type", Order>;
