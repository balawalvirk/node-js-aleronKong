import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ProductState } from 'src/types';

export type ProductCategoryDocument = ProductCategory & mongoose.Document;
@Schema({ timestamps: true })
export class ProductCategory {
  @Prop({ required: true })
  title: string;

  @Prop({ enum: ProductState, required: true })
  state: string;
}

export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);
