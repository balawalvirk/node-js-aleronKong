import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type ProductDocument = Product & mongoose.Document;
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: ['physical', 'digital'], required: true })
  state: string;

  @Prop({ required: true, type: [String] })
  media: string[];

  @Prop({ required: true })
  file: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  syncWithAmazon: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Product);
