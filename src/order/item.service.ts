import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { OrderItem, OrderItemDocument } from './item.schema';

@Injectable()
export class OrderItemService extends BaseService {
  constructor(@InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>) {
    super(orderItemModel);
  }
}
