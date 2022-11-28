import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { FundraisingCategory } from './category.schema';

export type FundraisingSubcategoryDocument = FundraisingSubcategory & mongoose.Document;
@Schema({ timestamps: true })
export class FundraisingSubcategory {
  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FundraisingCategory' })
  category: FundraisingCategory;
}

export const FundraisingSubcategorySchema = SchemaFactory.createForClass(FundraisingSubcategory);
