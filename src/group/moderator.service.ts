import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Moderator, ModeratorDocument } from './moderator.schema';

@Injectable()
export class ModeratorService extends BaseService<ModeratorDocument> {
  constructor(@InjectModel(Moderator.name) private moderatorModel: Model<ModeratorDocument>) {
    super(moderatorModel);
  }

  async create(data: ModeratorDocument | {}) {
    return (await this.moderatorModel.create(data)).populate({ path: 'user', select: 'avatar firstName lastName' });
  }

  async find(query: FilterQuery<ModeratorDocument>) {
    return await this.moderatorModel.find(query).populate({ path: 'user', select: 'avatar firstName lastName' });
  }
}
