import * as mongoose from 'mongoose';
import { Mute } from 'src/mute/mute.schema';
import { User } from 'src/users/users.schema';
import { Message } from './messages.schema';
export declare type ChatDocument = Chat & mongoose.Document;
export declare class Chat {
    members: User[];
    mutes: Mute[];
    lastMessage: Message;
    messages: Message[];
}
export declare const ChatSchema: mongoose.Schema<Chat, mongoose.Model<Chat, any, any, any, any>, {}, {}, {}, {}, "type", Chat>;
