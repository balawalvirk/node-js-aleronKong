import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Group, GroupDocument } from './group.schema';

@Injectable()
export class GroupService extends BaseService<GroupDocument> {
  constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>) {
    super(groupModel);
  }

  getPopulateFields() {
    return [
      {
        path: 'posts',
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: 'comments',
            select: 'content',
            options: { sort: { createdAt: -1 } },
            populate: { path: 'creator', select: 'firstName lastName avatar' },
          },
          {
            path: 'likes',
            select: 'firstName lastName avatar',
          },
          { path: 'creator', select: 'firstName lastName avatar' },
          { path: 'group', select: 'name' },
        ],
      },
    ];
  }

  async findOne(query: FilterQuery<GroupDocument>) {
    return await this.groupModel.findOne(query).populate(this.getPopulateFields()).lean();
  }

  async findAllMembers(query: FilterQuery<GroupDocument>) {
    return await this.groupModel
      .findOne(query)
      .populate({
        path: 'members.member',
        select: 'firstName lastName avatar',
      })
      .select('members -_id')
      .lean();
  }

  async findAllRequests(query: FilterQuery<GroupDocument>) {
    return await this.groupModel
      .findOne(query)
      .populate({ path: 'requests', select: 'firstName lastName avatar' })
      .select('-_id requests')
      .lean();
  }

  async feed(query: FilterQuery<GroupDocument>, options?: QueryOptions<GroupDocument>) {
    return await this.groupModel.find(query, {}, options).populate(this.getPopulateFields()).lean();
  }
}
