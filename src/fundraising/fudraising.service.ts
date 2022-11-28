import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FundraisingCategory, FundraisingCategoryDocument } from './category.schema';
import { CreateFudraisingCategoryDto } from './dtos/create-category';
import { CreateFudraisingSubCategoryDto } from './dtos/create-subCategory';
import { FundraisingSubcategory, FundraisingSubcategoryDocument } from './subCategory.schema';

@Injectable()
export class FudraisingService {
  constructor(
    @InjectModel(FundraisingCategory.name)
    private categoryModel: Model<FundraisingCategoryDocument>,
    @InjectModel(FundraisingSubcategory.name)
    private subCategoryModel: Model<FundraisingSubcategoryDocument>
  ) {}

  async createCategory(createFudraisingCategoryDto: CreateFudraisingCategoryDto) {
    return await this.categoryModel.create(createFudraisingCategoryDto);
  }

  async createSubCategory(createFudraisingSubCategoryDto: CreateFudraisingSubCategoryDto) {
    return await this.subCategoryModel.create(createFudraisingSubCategoryDto);
  }
}
