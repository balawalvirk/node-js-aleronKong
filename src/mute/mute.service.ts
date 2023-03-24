import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Mute, MuteDocument } from './mute.schema';

@Injectable()
export class MuteService extends BaseService<MuteDocument> {
  constructor(@InjectModel(Mute.name) private muteModel: Model<MuteDocument>) {
    super(muteModel);
  }
}
