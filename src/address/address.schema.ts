import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../users/users.schema';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  line1: string;

  @Prop({ required: true })
  line2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
