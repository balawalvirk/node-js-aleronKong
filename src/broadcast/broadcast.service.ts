import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Broadcast, BroadcastDocument } from './broadcast.schema';

@Injectable()
export class BroadcastService extends BaseService<BroadcastDocument> {
  constructor(@InjectModel(Broadcast.name) private broadcastModel: Model<BroadcastDocument>) {
    super(broadcastModel);
  }
}
