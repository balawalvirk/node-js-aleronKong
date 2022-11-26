import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { OrderItemDocument } from './item.schema';
export declare class OrderItemService extends BaseService {
    private orderItemModel;
    constructor(orderItemModel: Model<OrderItemDocument>);
}
