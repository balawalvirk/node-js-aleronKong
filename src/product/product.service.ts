import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Product, ProductDocument } from './product.schema';

@Injectable()
export class ProductService extends BaseService<ProductDocument> {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {
    super(productModel);
  }

  async create(query: FilterQuery<ProductDocument>) {
    return (await this.productModel.create(query)).populate('category creator');
  }

  async find(query: FilterQuery<ProductDocument>, options?: QueryOptions<ProductDocument>) {
    return await this.productModel.find(query, {}, options).populate('category');
  }

  async update(query: FilterQuery<ProductDocument>, updateQuery: UpdateQuery<ProductDocument>) {
    return await this.productModel.findOneAndUpdate(query, updateQuery).populate('category creator');
  }

  async findStoreProducts(query: FilterQuery<ProductDocument>, options?: QueryOptions<ProductDocument>) {
    return await this.productModel.aggregate([
      { $match: query },
      {
        $sort: !options?.sort ? { createdAt: -1 } : options?.sort,
      },
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
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      {
        $group: {
          _id: '$category._id',
          category: {
            $first: '$category.title',
          },
          type: {
            $first: '$$ROOT.type',
          },
          products: {
            $push: '$$ROOT',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          products: { $slice: ['$products', 10] },
          type: 1,
          category: 1,
          count: 1,
        },
      },
    ]);
  }

  async getSearchProducts() {
    return await this.productModel.aggregate([
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          latest: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $group: {
                _id: '$category._id',
                categoryTitle: {
                  $first: '$category.title',
                },
                type: {
                  $first: '$$ROOT.type',
                },
                products: {
                  $push: '$$ROOT',
                },
                count: {
                  $sum: 1,
                },
                category: {
                  $first: 'Latest',
                },
              },
            },
            {
              $set: {
                category: {
                  $concat: ['$category', ' ', '$categoryTitle'],
                },
              },
            },
          ],
          trending: [
            {
              $sort: {
                avgRating: -1,
              },
            },
            {
              $group: {
                _id: '$category._id',
                categoryTitle: {
                  $first: '$category.title',
                },
                type: {
                  $first: '$$ROOT.type',
                },
                products: {
                  $push: '$$ROOT',
                },
                count: {
                  $sum: 1,
                },
                category: {
                  $first: 'Trending',
                },
              },
            },
            {
              $set: {
                category: {
                  $concat: ['$category', ' ', '$categoryTitle'],
                },
              },
            },
          ],
          popular: [
            {
              $lookup: {
                from: 'sales',
                localField: '_id',
                foreignField: 'product',
                as: 'sales',
              },
            },
            {
              $set: {
                salesCount: {
                  $size: '$sales',
                },
              },
            },
            {
              $sort: {
                salesCount: -1,
              },
            },
            {
              $project: {
                sales: 0,
              },
            },
            {
              $group: {
                _id: '$category._id',
                categoryTitle: {
                  $first: '$category.title',
                },
                type: {
                  $first: '$$ROOT.type',
                },
                products: {
                  $push: '$$ROOT',
                },
                count: {
                  $sum: 1,
                },
                category: {
                  $first: 'Most Popular',
                },
              },
            },
            {
              $set: {
                category: {
                  $concat: ['$category', ' ', '$categoryTitle'],
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          latest: {
            $map: {
              input: '$latest',
              as: 'latest',
              in: {
                category: '$$latest.category',
                count: '$$latest.count',
                type: '$$latest.type',
                products: {
                  $slice: ['$$latest.products', 10],
                },
              },
            },
          },
          popular: {
            $map: {
              input: '$popular',
              as: 'popular',
              in: {
                _id: 0,
                category: '$$popular.category',
                count: '$$popular.count',
                type: '$$popular.type',
                products: {
                  $slice: ['$$popular.products', 10],
                },
              },
            },
          },
          trending: {
            $map: {
              input: '$trending',
              as: 'trending',
              in: {
                _id: 0,
                categoryTitle: 0,
                category: '$$trending.category',
                count: '$$trending.count',
                type: '$$trending.type',
                products: {
                  $slice: ['$$trending.products', 10],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          products: {
            $concatArrays: ['$trending', '$popular', '$latest'],
          },
        },
      },
    ]);
  }
}
