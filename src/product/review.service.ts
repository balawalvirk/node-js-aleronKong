import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers';
import { Review, ReviewDocument } from './review.schema';

@Injectable()
export class ReviewService extends BaseService<ReviewDocument> {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) {
    super(reviewModel);
  }
}
