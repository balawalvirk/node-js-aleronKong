import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { FriendRequest, FriendRequestDocument } from './friend-request.schema';

@Injectable()
export class FriendRequestService extends BaseService<FriendRequestDocument> {
  constructor(@InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequestDocument>) {
    super(friendRequestModel);
  }

  async create(data: {} | FriendRequestDocument) {
    return (await this.friendRequestModel.create(data)).populate({ path: 'receiver', select: 'fcmToken firstName lastName avatar' });
  }

  async findOne(query: FilterQuery<FriendRequestDocument>) {
    return await this.friendRequestModel.findOne(query).populate({ path: 'sender', select: 'fcmToken firstName lastName avatar' });
  }

  async find(query: FilterQuery<FriendRequestDocument>) {
    return await this.friendRequestModel.find(query).populate([
      { path: 'sender', select: 'fcmToken firstName lastName avatar' },
      { path: 'receiver', select: 'fcmToken firstName lastName avatar' },
    ]);
  }
}
