import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { ProductCategoryDocument } from './category.schema';
export declare class ProductCategoryService extends BaseService<ProductCategoryDocument> {
    private productCategoryModel;
    constructor(productCategoryModel: Model<ProductCategoryDocument>);
}
