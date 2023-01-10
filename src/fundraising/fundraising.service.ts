import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { Fundraising, FundraisingDocument } from './fundraising.schema';

@Injectable()
export class FundraisingService extends BaseService<FundraisingDocument> {
  constructor(
    @InjectModel(Fundraising.name)
    private readonly FundraisingModel: Model<FundraisingDocument>
  ) {
    super(FundraisingModel);
  }
}
