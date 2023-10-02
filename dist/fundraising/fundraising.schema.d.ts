import * as mongoose from 'mongoose';
import { FundraisingCategory } from 'src/fundraising/category.schema';
import { FundraisingSubcategory } from 'src/fundraising/subCategory.schema';
import { User } from 'src/users/users.schema';
export declare type FundraisingDocument = Fundraising & mongoose.Document;
export declare class Fundraising {
    title: string;
    subtitle: string;
    description: string;
    video: string;
    image: string;
    category: FundraisingCategory;
    subCategory: FundraisingSubcategory;
    location: string;
    launchDate: Date;
    compaignDuration: number;
    fundingGoal: number;
    bank: string;
    bankAccount: string;
    backers: number;
    currentFunding: number;
    isApproved: boolean;
    creator: User;
}
export declare const FundraisingSchema: mongoose.Schema<Fundraising, mongoose.Model<Fundraising, any, any, any, any>, {}, {}, {}, {}, "type", Fundraising>;
