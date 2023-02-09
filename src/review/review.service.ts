import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { BaseService } from 'src/helpers';
import { Review, ReviewDocument } from './review.schema';

@Injectable()
export class ReviewService extends BaseService<ReviewDocument> {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) {
    super(reviewModel);
  }

  async find(query: FilterQuery<ReviewDocument>, options?: QueryOptions<ReviewDocument>) {
    return await this.reviewModel.find(query, {}, options).populate({ path: 'creator', select: 'firstName lastName avatar' });
  }
}
