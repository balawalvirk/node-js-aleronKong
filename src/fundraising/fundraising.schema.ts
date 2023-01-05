import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { FundraisingCategory } from 'src/fundraising/category.schema';
import { FundraisingSubcategory } from 'src/fundraising/subCategory.schema';
import { User } from 'src/users/users.schema';

export type FundraisingDocument = Fundraising & mongoose.Document;
@Schema({ timestamps: true })
export class Fundraising {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  subtitle: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  video: string;

  @Prop()
  image: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FundraisingCategory' })
  category: FundraisingCategory;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FundraisingSubcategory' })
  subCategory: FundraisingSubcategory;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  launchDate: Date;

  @Prop({ required: true })
  compaignDuration: number;

  @Prop({ required: true })
  fundingGoal: number;

  @Prop()
  bank: string;

  @Prop()
  bankAccount: string;

  @Prop({ default: 0 })
  backers: number;

  @Prop({ default: 0 })
  currentFunding: number;
}

export const FundraisingSchema = SchemaFactory.createForClass(Fundraising);
