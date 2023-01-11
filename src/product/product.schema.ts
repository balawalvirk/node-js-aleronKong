import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ProductStatus, ProductType } from 'src/types';
import { User } from 'src/users/users.schema';
import { ProductCategory } from './category.schema';

// @Schema({ versionKey: false, _id: false })
// class Detail {
//   @Prop()
//   value: string;

//   @Prop()
//   quantity: number;
// }

// const DetailSchema = SchemaFactory.createForClass(Detail);

// @Schema({ versionKey: false, _id: false })
// class Attribute {
//   @Prop()
//   name: string;

//   @Prop({ type: [DetailSchema] })
//   details: Detail[];
// }

// const AttributeSchema = SchemaFactory.createForClass(Attribute);

export type ProductDocument = Product & mongoose.Document;
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' })
  category: ProductCategory;

  @Prop({ enum: ProductType, required: true })
  type: string;

  @Prop({ default: false })
  isShowCase: boolean;

  @Prop({ required: true, type: [String] })
  media: string[];

  @Prop()
  file: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  quantity: number;

  @Prop({ enum: ProductStatus, required: true })
  status: string;

  @Prop({ required: true })
  syncWithAmazon: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ type: [String] })
  tags: string[];

  @Prop()
  audioSample: string;

  @Prop()
  asin: string;

  @Prop()
  publicationDate: Date;

  @Prop()
  language: string;

  @Prop()
  fileSize: number;

  @Prop()
  textToSpeech: boolean;

  @Prop()
  enhancedTypeSetting: boolean;

  @Prop()
  xRay: boolean;

  @Prop()
  wordWise: boolean;

  @Prop()
  printLength: number;

  @Prop()
  lending: boolean;

  @Prop()
  simultaneousDeviceUsage: string;

  @Prop()
  reviews: number;

  @Prop({ type: [String] })
  availableColors: string[];

  @Prop({ type: [String] })
  availableSizes: string[];

  // @Prop({ type: [AttributeSchema] })
  // attributes: Attribute[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
