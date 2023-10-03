import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { ProductCategory } from './category.schema';
import { Review } from '../review/review.schema';
import { Track } from './tracking.schema';
export declare type ProductDocument = Product & mongoose.Document;
declare class Series {
    title: string;
    file: string;
    price: number;
    isFree: boolean;
    tracks: Track[];
}
export declare const SeriesSchema: mongoose.Schema<Series, mongoose.Model<Series, any, any, any, any>, {}, {}, {}, {}, "type", Series>;
export declare class Product {
    title: string;
    description: string;
    category: ProductCategory;
    type: string;
    isShowCase: boolean;
    media: string[];
    file: string;
    price: number;
    quantity: number;
    status: string;
    syncWithAmazon: boolean;
    creator: User;
    tags: string[];
    audioSample: string;
    asin: string;
    publicationDate: Date;
    language: string;
    fileSize: number;
    textToSpeech: boolean;
    enhancedTypeSetting: boolean;
    xRay: boolean;
    wordWise: boolean;
    printLength: number;
    lending: boolean;
    simultaneousDeviceUsage: string;
    availableColors: string[];
    availableSizes: string[];
    reviews: Review[];
    avgRating: number;
    webSeries: boolean;
    series: Series[];
    isFree: boolean;
    tracks: Track[];
}
export declare const ProductSchema: mongoose.Schema<Product, mongoose.Model<Product, any, any, any, any>, {}, {}, {}, {}, "type", Product>;
export {};