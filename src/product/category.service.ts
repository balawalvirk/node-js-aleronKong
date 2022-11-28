import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { ProductCategory, ProductCategoryDocument } from './category.schema';

@Injectable()
export class ProductCategoryService extends BaseService {
  constructor(
    @InjectModel(ProductCategory.name) private productCategoryModel: Model<ProductCategoryDocument>
  ) {
    super(productCategoryModel);
  }
}
