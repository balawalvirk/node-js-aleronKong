import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { OrderModule } from './order.module';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrderService extends BaseService<OrderDocument> {
  constructor(@InjectModel(Order.name) private OrderModel: Model<OrderDocument>) {
    super(OrderModel);
  }

  async findOne(query: FilterQuery<OrderModule>) {
    return await this.OrderModel.findOne(query).populate({
      path: 'items.item',
      select: 'creator title',
      populate: { path: 'creator', select: 'sellerId' },
    });
  }
}
