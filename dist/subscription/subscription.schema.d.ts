import * as mongoose from 'mongoose';
export declare type SubscriptionDocument = Subscription & mongoose.Document;
export declare class Subscription {
    title: string;
}
export declare const SubscriptionSchema: mongoose.Schema<Subscription, mongoose.Model<Subscription, any, any, any, any>, {}, {}, {}, {}, "type", Subscription>;
