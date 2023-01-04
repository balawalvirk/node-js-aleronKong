import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type PackageDocument = Package & mongoose.Document;
@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  media: string;

  //stripe price id
  @Prop({ required: true })
  priceId: string;

  //stripe product id
  @Prop({ required: true })
  productId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ default: false })
  isGuildPackage: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }] })
  buyers: User[];
}

export const PackageSchema = SchemaFactory.createForClass(Package);
