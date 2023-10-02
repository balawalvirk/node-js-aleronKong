import mongoose, { Document } from 'mongoose';
import { User } from './users.schema';
export declare type FriendRequestDocument = FriendRequest & Document;
export declare class FriendRequest {
    sender: User;
    receiver: User;
    status: string;
}
export declare const FriendRequestSchema: mongoose.Schema<FriendRequest, mongoose.Model<FriendRequest, any, any, any, any>, {}, {}, {}, {}, "type", FriendRequest>;
