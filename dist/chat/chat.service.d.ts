import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Chat, ChatDocument } from './chat.schema';
export declare class ChatService extends BaseService {
    private ChatModel;
    constructor(ChatModel: Model<ChatDocument>);
    findOne(query: any): Promise<Chat & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    save(senderId: string, receiverId: string): Promise<Omit<Chat & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAllChat(query: any): Promise<Omit<Chat & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
}
