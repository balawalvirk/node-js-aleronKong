import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Chat, ChatDocument } from './chat.schema';

@Injectable()
export class ChatService extends BaseService {
  constructor(@InjectModel(Chat.name) private ChatModel: Model<ChatDocument>) {
    super(ChatModel);
  }

  async findOne(query: any) {
    return await this.ChatModel.findOne(query).populate([
      { path: 'sender', select: 'firstName lastName avatar' },
      { path: 'receiver', select: 'firstName lastName avatar' },
      { path: 'messages' },
    ]);
  }

  async save(senderId: string, receiverId: string) {
    return (await new this.ChatModel({ sender: senderId, receiver: receiverId }).save()).populate([
      { path: 'sender', select: 'firstName lastName avatar' },
      { path: 'receiver', select: 'firstName lastName avatar' },
    ]);
  }

  async findAllChat(query: any) {
    return await this.ChatModel.find(query).populate([
      { path: 'sender', select: 'firstName lastName avatar' },
      { path: 'receiver', select: 'firstName lastName avatar' },
    ]);
  }
}
