import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
export declare type ProductDocument = Product & mongoose.Document;
export declare class Product {
    title: string;
    description: string;
    state: string;
    media: string[];
    file: string;
    price: number;
    quantity: number;
    type: string;
    syncWithAmazon: boolean;
    creator: User;
    tags: string[];
}
export declare const ProductSchema: mongoose.Schema<Product, mongoose.Model<Product, any, any, any, any>, {}, {}, {}, {}, "type", Product>;
