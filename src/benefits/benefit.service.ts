import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import {Benefit, BenefitDocument} from "src/benefits/benefit.schema";

@Injectable()
export class BenefitService extends BaseService<BenefitDocument> {
  constructor(@InjectModel(Benefit.name) private benefitModel: Model<BenefitDocument>) {
    super(benefitModel);
  }
}
