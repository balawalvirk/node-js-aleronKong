import * as mongoose from 'mongoose';
import { FundraisingCategory } from './category.schema';
export declare type FundraisingSubcategoryDocument = FundraisingSubcategory & mongoose.Document;
export declare class FundraisingSubcategory {
    title: string;
    category: FundraisingCategory;
}
export declare const FundraisingSubcategorySchema: mongoose.Schema<FundraisingSubcategory, mongoose.Model<FundraisingSubcategory, any, any, any, any>, {}, {}, {}, {}, "type", FundraisingSubcategory>;
