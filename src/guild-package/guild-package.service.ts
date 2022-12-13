import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { GuildPackage, GuildPackageDocument } from './guild-package.schema';

@Injectable()
export class GuildPackageService extends BaseService {
  constructor(
    @InjectModel(GuildPackage.name) private GuildPackageModel: Model<GuildPackageDocument>
  ) {
    super(GuildPackageModel);
  }
}
