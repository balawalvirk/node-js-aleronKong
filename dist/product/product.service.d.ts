import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { ProductDocument } from './product.schema';
export declare class ProductService extends BaseService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
}
