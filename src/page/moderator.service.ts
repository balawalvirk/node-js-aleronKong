import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import {PageModerator, PageModeratorDocument} from "src/page/moderator.schema";
import {ModeratorDocument} from "src/group/moderator.schema";

@Injectable()
export class PageModeratorService extends BaseService<PageModeratorDocument> {
  constructor(@InjectModel(PageModerator.name) private moderatorModel: Model<PageModeratorDocument>) {
    super(moderatorModel);
  }

  async create(data: PageModeratorDocument | {}) {
    return (await this.moderatorModel.create(data)).populate({ path: 'user', select: 'avatar firstName lastName' });
  }

  async find(query: FilterQuery<ModeratorDocument>) {
    return await this.moderatorModel.find(query).populate({ path: 'user', select: 'avatar firstName lastName' });
  }
}
