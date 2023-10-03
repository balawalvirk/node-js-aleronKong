import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import {PageReaction, PageReactionDocument} from "src/page/reaction.schema";

@Injectable()
export class PageReactionService extends BaseService<PageReactionDocument> {
  constructor(@InjectModel(PageReaction.name) private reactionModel: Model<PageReactionDocument>) {
    super(reactionModel);
  }

  async create(query: FilterQuery<PageReactionDocument>) {
    return (await this.reactionModel.create(query)).populate({ path: 'user', select: 'firstName lastName avatar' });
  }

  async update(query: FilterQuery<PageReactionDocument>, updateQuery: UpdateQuery<PageReactionDocument>) {
    return await this.reactionModel
      .findOneAndUpdate(query, updateQuery, { new: true })
      .populate({ path: 'user', select: 'firstName lastName avatar' });
  }
}
