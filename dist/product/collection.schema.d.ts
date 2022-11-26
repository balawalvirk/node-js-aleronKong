import * as mongoose from 'mongoose';
import { Product } from 'src/product/product.schema';
import { User } from 'src/users/users.schema';
export declare type CollectionDocument = Collection & mongoose.Document;
export declare class Collection {
    title: string;
    description: string;
    media: string[];
    tags: string[];
    type: string;
    conditions: string;
    products: Product[];
    creator: User[];
}
export declare const CollectionSchema: mongoose.Schema<Collection, mongoose.Model<Collection, any, any, any, any>, {}, {}, {}, {}, "type", Collection>;
