import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Fundraising } from './fundraising.schema';

export type FundDocument = Fund & mongoose.Document;
@Schema({ timestamps: true })
export class Fund {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Fundraising' })
  project: Fundraising;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  donator: User;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  beneficiary: User;

  @Prop({ required: true })
  price: number;
}

export const FundSchema = SchemaFactory.createForClass(Fund);
