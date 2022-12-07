import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Product, ProductDocument } from './product.schema';

@Injectable()
export class ProductService extends BaseService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {
    super(productModel);
  }

  async create(query: FilterQuery<any>) {
    return (await this.productModel.create(query)).populate('category');
  }
}
