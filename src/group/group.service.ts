import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { MuteDocument } from 'src/mute/mute.schema';
import { MuteInterval } from 'src/types';
import { Group, GroupDocument } from './group.schema';

@Injectable()
export class GroupService extends BaseService<GroupDocument> {
  constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>) {
    super(groupModel);
  }

  async findAllMembers(query: FilterQuery<GroupDocument>) {
    return await this.groupModel.findOne(query).populate({ path: 'members.member', select: 'firstName lastName avatar' }).select('members -_id');
  }

  async findAllRequests(query: FilterQuery<GroupDocument>) {
    return await this.groupModel.findOne(query).populate({ path: 'requests', select: 'firstName lastName avatar' }).select('-_id requests');
  }

  async isGroupMuted(mute: LeanDocument<MuteDocument>) {
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
  }
}
