import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Chat } from './chat.schema';
export declare type MessageDocument = Message & mongoose.Document;
export declare class Message {
    chat: Chat;
    sender: User;
    content: string;
    gif: string;
    videos: string[];
    images: string[];
}
export declare const MessageSchema: mongoose.Schema<Message, mongoose.Model<Message, any, any, any, any>, {}, {}, {}, {}, "type", Message>;
