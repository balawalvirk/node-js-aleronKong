import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { FundraisingCategoryDocument } from './category.schema';
export declare class FudraisingCategoryService extends BaseService<FundraisingCategoryDocument> {
    private FundraisingCategoryModel;
    constructor(FundraisingCategoryModel: Model<FundraisingCategoryDocument>);
}
