import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Product } from './product.schema';
export declare type TrackDocument = Track & mongoose.Document;
export declare class Track {
    page: number;
    product: Product;
    user: User;
    isCompleted: boolean;
    duration: number;
}
export declare const TrackSchema: mongoose.Schema<Track, mongoose.Model<Track, any, any, any, any>, {}, {}, {}, {}, "type", Track>;
