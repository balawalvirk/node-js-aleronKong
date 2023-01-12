import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Product } from './product.schema';

export type ReviewDocument = Review & mongoose.Document;
@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  review: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creator: User;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
