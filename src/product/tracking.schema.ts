import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Product } from './product.schema';

export type TrackDocument = Track & mongoose.Document;

@Schema({ timestamps: true })
export class Track {
  @Prop()
  page: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  duration: number;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
