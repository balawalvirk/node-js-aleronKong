import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Chat, ChatDocument } from './chat.schema';

@Injectable()
export class ChatService extends BaseService<ChatDocument> {
  constructor(@InjectModel(Chat.name) private ChatModel: Model<ChatDocument>) {
    super(ChatModel);
  }

  async create(members: string[], userId: string) {
    return (await this.ChatModel.create({ members })).populate({
      path: 'members',
      match: { _id: { $ne: userId } },
      select: 'avatar firstName lastName',
    });
  }

  async findAll(query: FilterQuery<ChatDocument>, userId: string, options?: QueryOptions<ChatDocument>) {
    return await this.ChatModel.find(query, {}, options)
      .populate([
        { path: 'members', match: { _id: { $ne: userId } }, select: 'avatar firstName lastName' },
        { path: 'lastMessage' },
        { path: 'messages', match: { isRead: false, receiver: userId } },
      ])
      .lean();
  }

  async findOne(query: FilterQuery<ChatDocument>, userId: string) {
    return await this.ChatModel.findOne(query)
      .populate([{ path: 'members', match: { _id: { $ne: userId } }, select: 'avatar firstName lastName' }, { path: 'mutes' }])
      .lean();
  }
}
