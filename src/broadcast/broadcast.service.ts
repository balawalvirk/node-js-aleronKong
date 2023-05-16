import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Broadcast, BroadcastDocument } from './broadcast.schema';

@Injectable()
export class BroadcastService extends BaseService<BroadcastDocument> {
  constructor(@InjectModel(Broadcast.name) private broadcastModel: Model<BroadcastDocument>) {
    super(broadcastModel);
  }

  async create(query: FilterQuery<BroadcastDocument>) {
    return (await this.broadcastModel.create(query)).populate('user');
  }
}
