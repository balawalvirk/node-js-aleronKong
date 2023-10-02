import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { MessageDocument } from './messages.schema';
export declare class MessageService extends BaseService<MessageDocument> {
    private messageModel;
    constructor(messageModel: Model<MessageDocument>);
}
