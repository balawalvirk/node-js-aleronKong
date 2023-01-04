import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Cart, CartDocument } from './cart.schema';

@Injectable()
export class CartService extends BaseService<CartDocument> {
  constructor(@InjectModel(Cart.name) private CartModel: Model<CartDocument>) {
    super(CartModel);
  }

  async findOne(query: FilterQuery<CartDocument>) {
    return await this.CartModel.findOne(query).populate({
      path: 'items.item',
      select: 'color size avatar title creator',
    });
  }

  async update(query: FilterQuery<CartDocument>, updateQuery: UpdateQuery<CartDocument>) {
    return await this.CartModel.findOneAndUpdate(query, updateQuery, { new: true }).populate({
      path: 'items.item',
      select: 'color size avatar title creator',
    });
  }
}
