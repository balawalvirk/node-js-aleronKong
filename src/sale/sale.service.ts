import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Sale, SaleDocument } from './sale.schema';

@Injectable()
export class SaleService extends BaseService {
  constructor(@InjectModel(Sale.name) private SaleModel: Model<SaleDocument>) {
    super(SaleModel);
  }
}
