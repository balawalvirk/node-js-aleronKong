import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Message, MessageDocument } from './messages.schema';

@Injectable()
export class MessageService extends BaseService<MessageDocument> {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {
    super(messageModel);
  }

  async find(query: FilterQuery<MessageDocument>) {
    return await this.messageModel
      .find(query)
      .populate({ path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } })
      .sort({ createdAt: 1 });
  }

  async findOneAndUpdate(query: FilterQuery<MessageDocument>, updateQuery: UpdateQuery<MessageDocument>) {
    return await this.messageModel
      .findOneAndUpdate(query, updateQuery, { new: true })
      .populate({ path: 'reactions', populate: { path: 'user', select: 'firstName lastName avatar' } });
  }
}
