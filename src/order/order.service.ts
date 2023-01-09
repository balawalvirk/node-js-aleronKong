import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrderService extends BaseService<OrderDocument> {
  constructor(@InjectModel(Order.name) private OrderModel: Model<OrderDocument>) {
    super(OrderModel);
  }

  async findAll(query: FilterQuery<OrderDocument>) {
    return await this.OrderModel.find(query)
      .populate([{ path: 'product', select: 'price' }])
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
