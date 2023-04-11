import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductType } from 'src/types';

export type ProductCategoryDocument = ProductCategory & Document;
@Schema({ timestamps: true })
export class ProductCategory {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ enum: ProductType, required: true })
  type: string;

  @Prop({ required: true })
  commission: number;
}

export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);
