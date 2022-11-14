import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from 'src/product/product.schema';
import { CollectionConditions, CollectionTypes } from 'src/types';
import { User } from 'src/users/users.schema';

export type CollectionDocument = Collection & mongoose.Document;
@Schema({ timestamps: true })
export class Collection {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: [String] })
  media: string[];

  @Prop({ required: true, type: [String] })
  tags: string[];

  @Prop({ enum: CollectionTypes, required: true })
  type: string;

  @Prop({ enum: CollectionConditions, required: true })
  conditions: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] })
  products: Product[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creator: User[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
