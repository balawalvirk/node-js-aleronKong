import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Track, TrackDocument } from './tracking.schema';

@Injectable()
export class TrackService extends BaseService<TrackDocument> {
  constructor(@InjectModel(Track.name) private trackModel: Model<TrackDocument>) {
    super(trackModel);
  }
}
