import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { FundraisingCategory, FundraisingCategoryDocument } from './category.schema';

@Injectable()
export class FudraisingCategoryService extends BaseService<FundraisingCategoryDocument> {
  constructor(
    @InjectModel(FundraisingCategory.name)
    private FundraisingCategoryModel: Model<FundraisingCategoryDocument>
  ) {
    super(FundraisingCategoryModel);
  }
}
