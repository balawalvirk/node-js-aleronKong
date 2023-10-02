import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Fundraising } from './fundraising.schema';
export declare type FundDocument = Fund & mongoose.Document;
export declare class Fund {
    project: Fundraising;
    donator: User;
    beneficiary: User;
    price: number;
}
export declare const FundSchema: mongoose.Schema<Fund, mongoose.Model<Fund, any, any, any, any>, {}, {}, {}, {}, "type", Fund>;
