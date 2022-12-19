import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Fundraising } from 'src/fundraising/fundraising.schema';
import { GuildPackage } from 'src/guild-package/guild-package.schema';
import { Package } from 'src/package/package.schema';
import { Product } from 'src/product/product.schema';
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GuildPackage' })
  guildPackage: GuildPackage;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  customer: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  seller: User;

  @Prop({ required: true })
  price: number;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
