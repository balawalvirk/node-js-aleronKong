import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Cart, CartDocument } from './cart.schema';

@Injectable()
export class CartService extends BaseService {
  constructor(@InjectModel(Cart.name) private CartModel: Model<CartDocument>) {
    super(CartModel);
  }

  async findOne(query: FilterQuery<any>) {
    return await this.CartModel.findOne(query).populate({
      path: 'items.item',
      select: 'color size avatar title',
    });
  }
}
