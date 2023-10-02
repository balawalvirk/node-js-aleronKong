import mongoose, { Document } from 'mongoose';
import { Product } from 'src/product/product.schema';
import { User } from 'src/users/users.schema';
export declare type SaleDocument = Sale & Document;
export declare class Sale {
    product: Product;
    productType: string;
    customer: User;
    price: number;
    seller: User;
    series: string[];
    quantity: number;
}
export declare const SaleSchema: mongoose.Schema<Sale, mongoose.Model<Sale, any, any, any, any>, {}, {}, {}, {}, "type", Sale>;
