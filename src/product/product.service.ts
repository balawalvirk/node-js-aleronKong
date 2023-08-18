import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { BoughtProductsSort } from 'src/types';
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

  async findOne(query: FilterQuery<ProductDocument>) {
    return await this.productModel
      .findOne(query)
      .populate([{ path: 'category' }, { path: 'creator' }, { path: 'series.tracks' }, { path: 'tracks' }]);
  }

  async update(query: FilterQuery<ProductDocument>, updateQuery: UpdateQuery<ProductDocument>) {
    return await this.productModel.findOneAndUpdate(query, updateQuery, { new: true }).populate('category creator');
  }

  calculateTax(price: number, commission: number) {
    const subTotal = price;
    const tax = Math.round((2 / 100) * subTotal);
    const total = Math.round((subTotal + tax) * 100);
    // make commission of admin dynamically by using commission of category of product
    const applicationFeeAmount = Math.round((commission / 100) * total);
    return { subTotal, tax, total, applicationFeeAmount };
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

  async getBoughtProducts(query: FilterQuery<ProductDocument>, sort: any) {
    return await this.productModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'tracks',
          localField: 'tracks',
          foreignField: '_id',
          as: 'tracks',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $unwind: {
          path: '$creator',
        },
      },
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
        },
      },
      {
        $group: {
          _id: '$creator._id',
          authorFirstName: {
            $first: '$creator.firstName',
          },
          authorLastName: {
            $first: '$creator.lastName',
          },
          products: {
            $push: '$$ROOT',
          },
          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: sort,
      },
    ]);
  }

  getBoughtProductsSorting(sort: string) {
    if (sort === BoughtProductsSort.TITLE) {
      return { 'products.title': 1 };
    } else if (sort === BoughtProductsSort.AUTHOR) {
      return { 'products.authorFirstName': 1, 'products.authorLastName': 1 };
    } else if (sort === BoughtProductsSort.UNREAD) {
      return { 'products.tracks.page': 1 };
    } else {
      return { 'products.tracks.isCompleted': -1, 'products.tracks.updatedAt': -1 };
    }
  }
}
