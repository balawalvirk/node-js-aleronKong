import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, LeanDocument, Model, QueryOptions } from 'mongoose';
import { Mute } from 'src/chat/chat.schema';
import { BaseService } from 'src/helpers/services/base.service';
import { MuteInterval } from 'src/types';
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
    return await this.groupModel.findOne(query).populate({ path: 'requests', select: 'firstName lastName avatar' }).select('-_id requests').lean();
  }

  async feed(query: FilterQuery<GroupDocument>, options?: QueryOptions<GroupDocument>) {
    return await this.groupModel.find(query, {}, options).populate(this.getPopulateFields()).lean();
  }

  isGroupMuted(mutes: LeanDocument<Mute>[], creator: string) {
    if (mutes) {
      //find mute object from group object
      //@ts-ignore
      const mute = mutes.find((val) => val.user.toString() == creator.toString());
      // check if current user muted the message
      if (mute) {
        const today = new Date();
        // check if mute interval is week or day.
        if (mute.interval === MuteInterval.DAY || MuteInterval.WEEK) {
          //check if current date is greater that the interval date i.e date is in past
          if (mute.date.getTime() < today.getTime()) return false;
          else return true;
        } else {
          if (today.getTime() <= mute.startTime.getTime() && today.getTime() >= mute.endTime.getTime()) return false;
          else return true;
        }
      } else return false;
    } else return false;
  }
}
