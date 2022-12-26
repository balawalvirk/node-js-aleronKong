import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Address } from 'src/address/address.schema';
import { Package } from 'src/package/package.schema';
import { AuthTypes, UserRole, UserStatus } from 'src/types';
import { Report, ReportSchema } from './report.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ trim: true })
  userName: string;

  @Prop()
  birthDate: Date;

  @Prop()
  avatar: string;

  @Prop({ default: AuthTypes.LOCAL, enum: AuthTypes })
  authType: string;

  @Prop({ default: [UserRole.CUSTOMER], enum: UserRole, type: [String] })
  role: string[];

  @Prop({ default: UserStatus.ACTIVE, enum: UserStatus })
  status: string;

  //stripe customer id
  @Prop()
  customerId: string;

  //stripe connect(express) account id
  @Prop()
  sellerId: string;

  @Prop()
  defaultPaymentMethod: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'address' })
  defaultAddress: Address;

  @Prop()
  fcmToken: string;

  @Prop({ default: false })
  isGuildMember: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  friends: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  blockedUsers: User[];

  @Prop({ type: [ReportSchema] })
  reports: Report[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }] })
  supportingPackages: Package[];
}

export const UserSchema = SchemaFactory.createForClass(User);
