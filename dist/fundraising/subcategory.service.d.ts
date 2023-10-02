import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { FundraisingSubcategoryDocument } from './subCategory.schema';
export declare class FudraisingSubCategoryService extends BaseService<FundraisingSubcategoryDocument> {
    private FundraisingSubCategoryModel;
    constructor(FundraisingSubCategoryModel: Model<FundraisingSubcategoryDocument>);
}
