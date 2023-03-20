import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Message, MessageDocument } from './messages.schema';

@Injectable()
export class MessageService extends BaseService<MessageDocument> {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {
    super(messageModel);
  }
}
