import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
export declare type ChatDocument = Chat & mongoose.Document;
export declare class Chat {
    members: User[];
}
export declare const ChatSchema: mongoose.Schema<Chat, mongoose.Model<Chat, any, any, any, any>, {}, {}, {}, {}, "type", Chat>;
