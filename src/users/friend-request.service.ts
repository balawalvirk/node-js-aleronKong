import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { FriendRequest, FriendRequestDocument } from './friend-request.schema';

@Injectable()
export class FriendRequestService extends BaseService<FriendRequestDocument> {
  constructor(@InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequestDocument>) {
    super(friendRequestModel);
  }
}
