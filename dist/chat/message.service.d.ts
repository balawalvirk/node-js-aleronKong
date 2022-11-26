import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { MessageDocument } from './messages.schema';
export declare class MessageService extends BaseService {
    private ChatModel;
    constructor(ChatModel: Model<MessageDocument>);
}
