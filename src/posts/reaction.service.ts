import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { AddReactionsDto } from './dtos/add-reactions.dto';
import { Reaction, ReactionDocument } from './reaction.schema';

@Injectable()
export class ReactionService extends BaseService<ReactionDocument> {
  constructor(@InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>) {
    super(reactionModel);
  }

  async create(query: FilterQuery<ReactionDocument>) {
    return (await this.reactionModel.create(query)).populate({ path: 'user', select: 'firstName lastName avatar' });
  }

  async update(query: FilterQuery<ReactionDocument>, updateQuery: UpdateQuery<ReactionDocument>) {
    return await this.reactionModel
      .findOneAndUpdate(query, updateQuery, { new: true })
      .populate({ path: 'user', select: 'firstName lastName avatar' });
  }
}
