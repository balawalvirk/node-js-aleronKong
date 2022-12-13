import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';

export type GuildPackageDocument = GuildPackage & mongoose.Document;
@Schema({ timestamps: true })
export class GuildPackage {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  image: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  buyers: User[];

  //stripe price id
  @Prop({ required: true })
  priceId: string;

  //stripe product id
  @Prop({ required: true })
  productId: string;
}

export const GuildPackageSchema = SchemaFactory.createForClass(GuildPackage);
