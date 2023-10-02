import * as mongoose from 'mongoose';
import { Order } from 'src/order/order.schema';
import { User } from 'src/users/users.schema';
import { Product } from '../product/product.schema';
export declare type ReviewDocument = Review & mongoose.Document;
export declare class Review {
    review: string;
    rating: number;
    product: Product;
    creator: User;
    order: Order;
}
export declare const ReviewSchema: mongoose.Schema<Review, mongoose.Model<Review, any, any, any, any>, {}, {}, {}, {}, "type", Review>;
