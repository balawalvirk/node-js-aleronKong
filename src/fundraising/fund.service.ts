import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { Fund, FundDocument } from './fund.schema';

@Injectable()
export class FundService extends BaseService<FundDocument> {
  constructor(
    @InjectModel(Fund.name)
    private readonly FundModel: Model<FundDocument>
  ) {
    super(FundModel);
  }
}
