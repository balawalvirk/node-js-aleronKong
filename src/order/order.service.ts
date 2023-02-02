import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrderService extends BaseService<OrderDocument> {
  constructor(@InjectModel(Order.name) private OrderModel: Model<OrderDocument>) {
    super(OrderModel);
  }

  getOrderNumber() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const random = ('' + Math.random()).substring(2, 8);
    const random_number = timestamp + random;
    return random_number;
  }

  async find(query: FilterQuery<OrderDocument>, options?: QueryOptions<OrderDocument>) {
    return await this.OrderModel.find(query, {}, options)
      .populate([
        { path: 'product', select: 'media title creator price' },
        { path: 'customer', select: 'firstName lastName email' },
      ])
      .lean();
  }

  async findOne(query: FilterQuery<OrderDocument>) {
    return await this.OrderModel.findOne(query)
      .populate([
        {
          path: 'product',
          select: 'media title creator price',
          populate: { path: 'creator', select: 'sellerId' },
        },
        { path: 'address' },
        { path: 'customer', select: 'firstName lastName email' },
      ])
      .lean();
  }

  async findOneAndUpdate(query: FilterQuery<OrderDocument>, updateQuery: UpdateQuery<OrderDocument>) {
    return await this.OrderModel.findOneAndUpdate(query, updateQuery, { new: true })
      .populate([
        {
          path: 'product',
          select: 'media title creator price',
          populate: { path: 'creator', select: 'sellerId' },
        },
        { path: 'address' },
      ])
      .lean();
  }
}
