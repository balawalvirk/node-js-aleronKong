import * as mongoose from 'mongoose';
export declare type FundraisingCategoryDocument = FundraisingCategory & mongoose.Document;
export declare class FundraisingCategory {
    title: string;
}
export declare const FundraisingCategorySchema: mongoose.Schema<FundraisingCategory, mongoose.Model<FundraisingCategory, any, any, any, any>, {}, {}, {}, {}, "type", FundraisingCategory>;
