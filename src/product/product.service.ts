import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Product, ProductDocument } from './product.schema';

@Injectable()
export class ProductService extends BaseService<ProductDocument> {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {
    super(productModel);
  }

  async create(query: FilterQuery<ProductDocument>) {
    return (await this.productModel.create(query)).populate('category');
  }

  async findAll(query: FilterQuery<ProductDocument>) {
    return await this.productModel.find(query).populate('category');
  }

  async update(query: FilterQuery<ProductDocument>, updateQuery: UpdateQuery<ProductDocument>) {
    return await this.productModel.findOneAndUpdate(query, updateQuery).populate('category');
  }

  async findStoreProducts(query: FilterQuery<ProductDocument>, sort?: any) {
    return await this.productModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.title',
          data: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $sort: !sort ? { createdAt: -1 } : sort,
      },
    ]);
  }
}
