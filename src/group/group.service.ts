import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Group, GroupDocument } from './group.schema';

@Injectable()
export class GroupService extends BaseService {
  constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>) {
    super(groupModel);
  }

  async findOne(query: FilterQuery<any>) {
    return await this.groupModel.findOne(query).populate({
      path: 'posts',
      populate: [
        {
          path: 'comments',
          select: 'content',
          populate: { path: 'creator', select: 'firstName lastName avatar' },
        },
        {
          path: 'likes',
          select: 'firstName lastName avatar',
        },
        { path: 'creator', select: 'firstName lastName avatar' },
        { path: 'group', select: 'name' },
      ],
    });
  }

  async findAllMembers(query: FilterQuery<any>) {
    return await this.groupModel
      .findOne(query)
      .populate({
        path: 'members.member',
        select: 'firstName lastName avatar',
      })
      .select('members -_id');
  }
}
