import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { GroupInvitation, GroupInvitationDocument } from './invitation.schema';

@Injectable()
export class GroupInvitationService extends BaseService<GroupInvitationDocument> {
  constructor(@InjectModel(GroupInvitation.name) private groupInvitationModel: Model<GroupInvitationDocument>) {
    super(groupInvitationModel);
  }

  getPopulateFields() {
    return [{ path: 'group' }, { path: 'friend', select: 'firstName lastName avatar fcmToken' }];
  }

  async create(query: FilterQuery<GroupInvitationDocument>) {
    return await (await this.groupInvitationModel.create(query)).populate(this.getPopulateFields());
  }

  async find(filter: FilterQuery<GroupInvitationDocument>) {
    return await this.groupInvitationModel.find(filter).populate(this.getPopulateFields()).lean();
  }

  async findOneAndUpdate(query: FilterQuery<GroupInvitationDocument>, updateQuery: UpdateQuery<GroupInvitationDocument>) {
    return await this.groupInvitationModel.findOneAndUpdate(query, updateQuery, { new: true }).populate(this.getPopulateFields()).lean();
  }
}
