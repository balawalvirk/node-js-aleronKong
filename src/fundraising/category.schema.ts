import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type FundraisingCategoryDocument = FundraisingCategory & mongoose.Document;
@Schema({ timestamps: true })
export class FundraisingCategory {
  @Prop({ required: true })
  title: string;
}

export const FundraisingCategorySchema = SchemaFactory.createForClass(FundraisingCategory);
