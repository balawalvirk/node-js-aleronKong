import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Reaction, ReactionDocument } from './reaction.schema';

@Injectable()
export class ReactionService extends BaseService<ReactionDocument> {
  constructor(@InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>) {
    super(reactionModel);
  }
}
