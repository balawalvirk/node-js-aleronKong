import mongoose from 'mongoose';
import { Product } from 'src/product/product.schema';
import { User } from 'src/users/users.schema';
export declare type CartDocument = Cart & mongoose.Document;
export declare class Item {
    item: Product;
    quantity: number;
    selectedColor: string;
    selectedSize: string;
}
export declare const ItemSchema: mongoose.Schema<Item, mongoose.Model<Item, any, any, any, any>, {}, {}, {}, {}, "type", Item>;
export declare class Cart {
    items: Item[];
    creator: User;
}
export declare const CartSchema: mongoose.Schema<Cart, mongoose.Model<Cart, any, any, any, any>, {}, {}, {}, {}, "type", Cart>;
