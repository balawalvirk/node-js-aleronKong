import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
export declare type PackageDocument = Package & mongoose.Document;
export declare class Package {
    title: string;
    description: string;
    price: number;
    media: string;
    priceId: string;
    productId: string;
    creator: User;
    isGuildPackage: boolean;
    buyers: User[];
}
export declare const PackageSchema: mongoose.Schema<Package, mongoose.Model<Package, any, any, any, any>, {}, {}, {}, {}, "type", Package>;
