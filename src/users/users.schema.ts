import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuthTypes, UserRole, UserStatus } from 'src/types';

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

  @Prop({ default: UserRole.CUSTOMER, enum: UserRole })
  role: string;

  @Prop({ default: UserStatus.ACTIVE, enum: UserStatus })
  status: string;

  //stripe customer id
  @Prop()
  customerId: string;

  //stripe connect(express) account id
  @Prop()
  accountId: string;

  @Prop()
  paymentMethod: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
