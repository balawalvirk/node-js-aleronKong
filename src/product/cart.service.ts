import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Cart, CartDocument, Item } from './cart.schema';

@Injectable()
export class CartService extends BaseService<CartDocument> {
  constructor(@InjectModel(Cart.name) private CartModel: Model<CartDocument>) {
    super(CartModel);
  }

  calculateTax(items: Item[]) {
    const subTotal = items.reduce((n, { item, quantity }) => n + item.price * quantity, 0);
    const tax = Math.round((2 / 100) * subTotal);
    const total = subTotal + tax;
    return { subTotal, tax, total };
  }

  async create(data: CartDocument | {}) {
    return (await this.CartModel.create(data)).populate({
      path: 'items.item',
      select: 'media title creator price',
    });
  }

  async findOne(query: FilterQuery<CartDocument>) {
    return await this.CartModel.findOne(query)
      .populate({
        path: 'items.item',
        select: 'media title creator price',
        populate: { path: 'creator', select: 'fcmToken' },
      })
      .lean();
  }

  async findOneAndUpdate(query: FilterQuery<CartDocument>, updateQuery: UpdateQuery<CartDocument>) {
    return await this.CartModel.findOneAndUpdate(query, updateQuery, { new: true })
      .populate({
        path: 'items.item',
        select: 'media title creator price',
      })
      .lean();
  }
}
