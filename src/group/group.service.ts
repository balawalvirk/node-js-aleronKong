import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, LeanDocument, Model} from 'mongoose';
import {BaseService} from 'src/helpers/services/base.service';
import {MuteDocument} from 'src/mute/mute.schema';
import {MuteInterval} from 'src/types';
import {Group, GroupDocument} from './group.schema';

@Injectable()
export class GroupService extends BaseService<GroupDocument> {
    constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>) {
        super(groupModel);
    }

    async findAllMembers(query: FilterQuery<GroupDocument>) {
        const group: any = await this.groupModel.findOne(query)
            .populate({path: 'members.member', select: 'firstName lastName avatar'})
            .populate({path: 'page_members.page'})
            .select('members -_id page_members')
            .lean();

        if(group){
            group.members = (group.members || []).concat(group.page_members || [])
            group.requests = (group.requests || []).concat(group.pageRequests || [])
            delete group.page_members;
            delete group.pageRequests;
        }

        return group;

    }

    async findAllRequests(query: FilterQuery<GroupDocument>) {
        const group:any = await this.groupModel.findOne(query).populate({
            path: 'requests',
            select: 'firstName lastName avatar'
        })
            .populate({path: 'pageRequests'})
            .select('-_id requests pageRequests')
            .lean();

        if(group){
            group.members = (group.members || []).concat(group.page_members || [])
            group.requests = (group.requests || []).concat(group.pageRequests || [])
            delete group.page_members;
            delete group.pageRequests;

        }
        return group;
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
