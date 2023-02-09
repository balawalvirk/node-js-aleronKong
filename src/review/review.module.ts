import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from '../review/review.schema';
import { ReviewService } from '../review/review.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }])],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
