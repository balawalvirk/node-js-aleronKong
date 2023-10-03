import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import {PageInvitation, PageInvitationDocument} from "src/page/invitation.schema";

@Injectable()
export class PageInvitationService extends BaseService<PageInvitationDocument> {
  constructor(@InjectModel(PageInvitation.name) private pageInvitationModel: Model<PageInvitationDocument>) {
    super(pageInvitationModel);
  }

  getPopulateFields() {
    return [{ path: 'page' }, { path: 'friend', select: '_id firstName lastName avatar fcmToken' },
        { path: 'user', select: '_id firstName lastName avatar fcmToken' }];
  }

  async create(query: FilterQuery<PageInvitationDocument>) {
    return await (await this.pageInvitationModel.create(query)).populate(this.getPopulateFields());
  }

  async find(filter: FilterQuery<PageInvitationDocument>) {
    return await this.pageInvitationModel.find(filter).populate(this.getPopulateFields());
  }

  async findOneAndUpdate(query: FilterQuery<PageInvitationDocument>, updateQuery: UpdateQuery<PageInvitationDocument>) {
    return await this.pageInvitationModel.findOneAndUpdate(query, updateQuery, { new: true }).populate(this.getPopulateFields());
  }

  async findOne(query: FilterQuery<PageInvitationDocument>) {
    return await this.pageInvitationModel.findOne(query).populate(this.getPopulateFields());
  }
}
