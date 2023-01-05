import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Fundraising } from 'src/fundraising/fundraising.schema';
import { Package } from 'src/package/package.schema';
import { Product } from 'src/product/product.schema';
import { SaleType } from 'src/types';
import { User } from 'src/users/users.schema';

export type SaleDocument = Sale & Document;

@Schema({ timestamps: true })
export class Sale {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Package' })
  package: Package;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Fundraising' })
  fundraising: Fundraising;

  @Prop({ enum: SaleType, required: true })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  customer: User;

  @Prop({ required: true })
  price: number;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
