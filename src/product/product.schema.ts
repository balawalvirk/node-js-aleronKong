import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ProductState, ProductTypes } from 'src/types';
import { User } from 'src/users/users.schema';

export type ProductDocument = Product & mongoose.Document;
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: ProductState, required: true })
  state: string;

  @Prop({ required: true, type: [String] })
  media: string[];

  @Prop({ required: true })
  file: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ enum: ProductTypes, required: true })
  type: string;

  @Prop({ required: true })
  syncWithAmazon: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  buyers: User[];

  @Prop({ required: true, default: 0 })
  soldUnits: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
