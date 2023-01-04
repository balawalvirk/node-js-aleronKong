import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { FundraisingSubcategory, FundraisingSubcategoryDocument } from './subCategory.schema';

@Injectable()
export class FudraisingSubCategoryService extends BaseService<FundraisingSubcategoryDocument> {
  constructor(
    @InjectModel(FundraisingSubcategory.name)
    private FundraisingSubCategoryModel: Model<FundraisingSubcategoryDocument>
  ) {
    super(FundraisingSubCategoryModel);
  }
}
