import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ProductType } from 'src/types';

export type ProductCategoryDocument = ProductCategory & mongoose.Document;
@Schema({ timestamps: true })
export class ProductCategory {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ enum: ProductType, required: true })
  type: string;
}

export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);
