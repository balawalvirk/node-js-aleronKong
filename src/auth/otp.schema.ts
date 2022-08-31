import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  otp: number;

  @Prop({ required: true })
  expireIn: number;

  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
