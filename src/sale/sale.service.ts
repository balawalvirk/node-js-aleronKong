import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Sale, SaleDocument } from './sale.schema';

@Injectable()
export class SaleService extends BaseService<SaleDocument> {
  constructor(@InjectModel(Sale.name) private SaleModel: Model<SaleDocument>) {
    super(SaleModel);
  }

  async findPackagesSellers(query: FilterQuery<SaleDocument>) {
    return await this.SaleModel.find(query).populate({ path: 'seller', select: 'firstName lastName avatar' });
  }
}
